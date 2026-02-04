import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq, sql } from 'drizzle-orm';
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

    if (user) {
      // Ensure status is active on login
      if (user.status !== 'active') {
        await this.db.update(schema.users).set({ status: 'active' }).where(eq(schema.users.id, user.id));
        user = { ...user, status: 'active' };
      }
      return user;
    }

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
      // Check if this is the first user (make them admin)
      const userCount = await this.db.select({ count: sql`count(*)` }).from(schema.users);
      const isFirstUser = userCount[0]?.count === 0;
      
      await this.db.insert(schema.users).values({ 
        id, 
        ...profile,
        role: isFirstUser ? 'admin' : 'user',
        status: 'active', // Auto-activate all users
      });
      await this.db.insert(schema.userSettings).values({ userId: id });
      user = await this.db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });
    }

    return user!;
  }

  async getOrCreateDevUser(email: string = 'simon.franz@hrworks.de') {
    let user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (!user) {
      const id = uuid();
      const isAdmin = email === 'simon.franz@hrworks.de';
      await this.db.insert(schema.users).values({
        id,
        email,
        name: email === 'simon.franz@hrworks.de' ? 'Simon Franz' : 'Simon Franz 2',
        googleId: 'dev-' + id,
        role: isAdmin ? 'admin' : 'user',
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
