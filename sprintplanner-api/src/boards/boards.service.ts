import { Inject, Injectable } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { DATABASE } from '../db/database.module';
import type { DbType } from '../db';
import { schema } from '../db';
import { BoardEventsService } from './board-events.service';

@Injectable()
export class BoardsService {
  constructor(
    @Inject(DATABASE) private db: DbType,
    private boardEvents: BoardEventsService,
  ) {}

  async findAll(userId: string) {
    const owned = await this.db.query.boards.findMany({
      where: eq(schema.boards.ownerId, userId),
    });

    const shared = await this.db
      .select({ board: schema.boards, role: schema.boardMembers.role })
      .from(schema.boardMembers)
      .innerJoin(schema.boards, eq(schema.boards.id, schema.boardMembers.boardId))
      .where(eq(schema.boardMembers.userId, userId));

    const publicBoards = await this.db.query.boards.findMany({
      where: eq(schema.boards.isPublic, true),
    });

    // Load members for all boards
    const allBoardIds = [...owned.map(b => b.id), ...shared.map(s => s.board.id)];
    const members = allBoardIds.length ? await this.db
      .select({
        boardId: schema.boardMembers.boardId,
        name: schema.users.name,
        avatarUrl: schema.users.avatarUrl,
      })
      .from(schema.boardMembers)
      .leftJoin(schema.users, eq(schema.users.id, schema.boardMembers.userId))
      .where(inArray(schema.boardMembers.boardId, allBoardIds)) : [];

    const membersByBoard = members.reduce((acc, m) => {
      if (!acc[m.boardId]) acc[m.boardId] = [];
      if (m.name) acc[m.boardId].push({ name: m.name, avatarUrl: m.avatarUrl });
      return acc;
    }, {} as Record<string, any[]>);

    return {
      owned: owned.map(b => ({ ...b, members: membersByBoard[b.id] || [] })),
      shared: shared.map((s) => ({ ...s.board, role: s.role, members: membersByBoard[s.board.id] || [] })),
      public: publicBoards.filter((b) => b.ownerId !== userId),
    };
  }

  async findOne(id: string) {
    const board = await this.db.query.boards.findFirst({
      where: eq(schema.boards.id, id),
    });
    if (!board) return null;
    
    const owner = await this.db.query.users.findFirst({
      where: eq(schema.users.id, board.ownerId),
      columns: { name: true, email: true, avatarUrl: true },
    });
    
    return { ...board, owner };
  }

  async create(ownerId: string, name: string) {
    const id = uuid();
    await this.db.insert(schema.boards).values({ id, name, ownerId });
    return this.findOne(id);
  }

  async update(id: string, data: { name?: string; data?: string; isPublic?: boolean; allowedDomain?: string | null }) {
    await this.db
      .update(schema.boards)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.boards.id, id));
    
    const board = await this.findOne(id);
    this.boardEvents.emit(id, 'update', board);
    return board;
  }

  async updateData(id: string, data: string) {
    await this.db
      .update(schema.boards)
      .set({ data, updatedAt: new Date() })
      .where(eq(schema.boards.id, id));
  }

  async delete(id: string) {
    await this.db.delete(schema.boards).where(eq(schema.boards.id, id));
    this.boardEvents.emit(id, 'delete', { id });
  }

  async getMemberRole(boardId: string, userId: string, userEmail?: string) {
    const board = await this.db.query.boards.findFirst({
      where: eq(schema.boards.id, boardId),
    });
    if (!board) return null;
    if (board.ownerId === userId) return 'owner';

    const member = await this.db.query.boardMembers.findFirst({
      where: and(
        eq(schema.boardMembers.boardId, boardId),
        eq(schema.boardMembers.userId, userId),
      ),
    });
    if (member) return member.role;
    
    // Check domain access
    if (board.allowedDomain && userEmail) {
      const domain = userEmail.split('@')[1];
      if (domain === board.allowedDomain) return 'viewer';
    }
    
    if (board.isPublic) return 'viewer';
    return null;
  }
}
