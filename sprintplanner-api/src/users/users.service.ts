import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DATABASE } from '../db/database.module';
import type { DbType } from '../db';
import { schema } from '../db';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE) private db: DbType,
    private mailService: MailService,
  ) {}

  async findById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }

  async findAll() {
    const users = await this.db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const stats = await this.db.all<{ userId: string; owned: number; editor: number; viewer: number }>(sql`
      SELECT 
        u.id as userId,
        (SELECT COUNT(*) FROM boards WHERE owner_id = u.id) as owned,
        (SELECT COUNT(*) FROM board_members WHERE user_id = u.id AND role = 'editor') as editor,
        (SELECT COUNT(*) FROM board_members WHERE user_id = u.id AND role = 'viewer') as viewer
      FROM users u
    `);

    const statsMap = Object.fromEntries(stats.map(s => [s.userId, s]));
    return users.map(u => ({ ...u, ...statsMap[u.id] }));
  }

  async inviteUser(email: string) {
    const existing = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (existing) {
      return { message: 'User already exists', user: existing };
    }

    const id = randomBytes(16).toString('hex');
    const [user] = await this.db.insert(schema.users).values({
      id,
      email,
      role: 'user',
      status: 'pending',
    }).returning();

    await this.mailService.sendUserInvite(email);

    return user;
  }

  async deleteUser(id: string) {
    await this.db.delete(schema.users).where(eq(schema.users.id, id));
    return { message: 'User deleted' };
  }

  async updateRole(id: string, role: 'admin' | 'user' | 'viewer') {
    await this.db.update(schema.users).set({ role }).where(eq(schema.users.id, id));
    return this.findById(id);
  }

  async getUserBoards(userId: string) {
    const boards = await this.db.query.boards.findMany({
      where: eq(schema.boards.ownerId, userId),
      columns: {
        id: true,
        name: true,
        description: true,
        data: true,
        isPublic: true,
        updatedAt: true,
      },
    });

    const boardIds = boards.map(b => b.id);
    if (boardIds.length === 0) return [];

    const members = await this.db
      .select({
        boardId: schema.boardMembers.boardId,
        role: schema.boardMembers.role,
        userId: schema.users.id,
        userName: schema.users.name,
        userEmail: schema.users.email,
        userAvatar: schema.users.avatarUrl,
      })
      .from(schema.boardMembers)
      .leftJoin(schema.users, eq(schema.users.id, schema.boardMembers.userId))
      .where(sql`${schema.boardMembers.boardId} IN (${sql.join(boardIds.map(id => sql`${id}`), sql`, `)})`);

    const membersByBoard = members.reduce((acc, m) => {
      if (!acc[m.boardId]) acc[m.boardId] = [];
      acc[m.boardId].push({ id: m.userId, name: m.userName, email: m.userEmail, avatarUrl: m.userAvatar, role: m.role });
      return acc;
    }, {} as Record<string, any[]>);

    return boards.map(b => ({
      ...b,
      members: membersByBoard[b.id] || [],
    }));
  }

  async getSettings(userId: string) {
    return this.db.query.userSettings.findFirst({
      where: eq(schema.userSettings.userId, userId),
    });
  }

  async updateSettings(userId: string, data: { showMyCursor?: boolean; showOtherCursors?: boolean }) {
    await this.db
      .update(schema.userSettings)
      .set(data)
      .where(eq(schema.userSettings.userId, userId));
    return this.getSettings(userId);
  }
}

