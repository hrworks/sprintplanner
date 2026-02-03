import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import type { Response } from 'express';
import { DATABASE } from '../db/database.module';
import type { DbType } from '../db';
import { schema } from '../db';
import { OptionalAuthGuard } from '../auth/guards';

@Controller('invite')
export class InviteController {
  constructor(
    @Inject(DATABASE) private db: DbType,
    private config: ConfigService,
  ) {}

  @Get(':token')
  @UseGuards(OptionalAuthGuard)
  async acceptInvite(@Param('token') token: string, @Req() req: any, @Res() res: Response) {
    const member = await this.db.query.boardMembers.findFirst({
      where: eq(schema.boardMembers.inviteToken, token),
    });

    if (!member) {
      return res.redirect(`${this.config.get('FRONTEND_URL')}?error=invalid_invite`);
    }

    if (!req.user) {
      // Nicht eingeloggt - redirect zu Login mit Token
      return res.redirect(`/auth/google?redirect=/invite/${token}`);
    }

    // User eingeloggt - Einladung annehmen
    await this.db
      .update(schema.boardMembers)
      .set({ userId: req.user.id, acceptedAt: new Date(), inviteToken: null })
      .where(eq(schema.boardMembers.id, member.id));

    return res.redirect(`${this.config.get('FRONTEND_URL')}?board=${member.boardId}`);
  }
}
