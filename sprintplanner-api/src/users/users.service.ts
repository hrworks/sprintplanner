import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
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
    return this.db.query.users.findMany({
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

  async updateRole(id: string, role: 'admin' | 'user') {
    await this.db.update(schema.users).set({ role }).where(eq(schema.users.id, id));
    return this.findById(id);
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

