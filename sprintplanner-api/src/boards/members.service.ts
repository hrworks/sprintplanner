import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { DATABASE } from '../db/database.module';
import type { DbType } from '../db';
import { schema } from '../db';
import { MailService } from '../mail/mail.service';

@Injectable()
export class MembersService {
  constructor(
    @Inject(DATABASE) private db: DbType,
    private mailService: MailService,
  ) {}

  async findAll(boardId: string) {
    return this.db
      .select({
        id: schema.boardMembers.id,
        email: schema.boardMembers.invitedEmail,
        role: schema.boardMembers.role,
        userId: schema.boardMembers.userId,
        invitedAt: schema.boardMembers.invitedAt,
        acceptedAt: schema.boardMembers.acceptedAt,
        user: schema.users,
      })
      .from(schema.boardMembers)
      .leftJoin(schema.users, eq(schema.users.id, schema.boardMembers.userId))
      .where(eq(schema.boardMembers.boardId, boardId));
  }

  async invite(boardId: string, email: string, role: 'editor' | 'viewer', inviter: { id: string; name: string }) {
    // Check if already invited
    const existingMember = await this.db.query.boardMembers.findFirst({
      where: and(
        eq(schema.boardMembers.boardId, boardId),
        eq(schema.boardMembers.invitedEmail, email)
      ),
    });

    if (existingMember) {
      throw new Error('User already invited to this board');
    }

    let existingUser = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!existingUser) {
      const userId = uuid();
      await this.db.insert(schema.users).values({
        id: userId,
        email,
        role: 'user',
        status: 'pending',
      });
      existingUser = await this.db.query.users.findFirst({
        where: eq(schema.users.id, userId),
      });
    }

    const id = uuid();
    const inviteToken = existingUser?.status === 'pending' ? uuid() : null;

    await this.db.insert(schema.boardMembers).values({
      id,
      boardId,
      invitedEmail: email,
      role,
      userId: existingUser?.id,
      inviteToken,
      acceptedAt: existingUser?.status === 'active' ? new Date() : null,
    });

    if (inviteToken) {
      const board = await this.db.query.boards.findFirst({
        where: eq(schema.boards.id, boardId),
      });
      await this.mailService.sendInvite(email, board?.name || 'Board', inviter.name || 'Jemand', inviteToken);
    }

    return this.db.query.boardMembers.findFirst({
      where: eq(schema.boardMembers.id, id),
    });
  }

  async updateRole(memberId: string, role: 'editor' | 'viewer') {
    await this.db
      .update(schema.boardMembers)
      .set({ role })
      .where(eq(schema.boardMembers.id, memberId));
  }

  async remove(memberId: string) {
    await this.db.delete(schema.boardMembers).where(eq(schema.boardMembers.id, memberId));
  }
}
