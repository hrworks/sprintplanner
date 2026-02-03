import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { DATABASE } from '../db/database.module';
import type { DbType } from '../db';
import { schema } from '../db';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE) private db: DbType,
    private jwtService: JwtService,
  ) {}

  async validateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }) {
    let user = await this.db.query.users.findFirst({
      where: eq(schema.users.googleId, profile.googleId),
    });

    if (!user) {
      const existing = await this.db.query.users.findFirst({
        where: eq(schema.users.email, profile.email),
      });

      if (existing) {
        await this.db
          .update(schema.users)
          .set({ googleId: profile.googleId, name: profile.name, avatarUrl: profile.avatarUrl, status: 'active' })
          .where(eq(schema.users.id, existing.id));
        user = existing;
      } else {
        const id = uuid();
        await this.db.insert(schema.users).values({ 
          id, 
          ...profile,
          role: 'user',
          status: 'pending',
        });
        await this.db.insert(schema.userSettings).values({ userId: id });
        user = await this.db.query.users.findFirst({
          where: eq(schema.users.id, id),
        });
      }
    }

    if (user?.status !== 'active') {
      throw new Error('Account not activated. Please contact an administrator.');
    }

    return user!;
  }

  async getOrCreateDevUser() {
    const devEmail = 'simon.franz@hrworks.de';
    let user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, devEmail),
    });

    if (!user) {
      const id = uuid();
      await this.db.insert(schema.users).values({
        id,
        email: devEmail,
        name: 'Simon Franz',
        googleId: 'dev-' + id,
        role: 'admin',
        status: 'active',
      });
      await this.db.insert(schema.userSettings).values({ userId: id });
      user = await this.db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });
    }

    return user!;
  }

  generateToken(user: { id: string; email: string; name?: string | null }) {
    return this.jwtService.sign({ sub: user.id, email: user.email, name: user.name });
  }

  async getUser(id: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }
}
