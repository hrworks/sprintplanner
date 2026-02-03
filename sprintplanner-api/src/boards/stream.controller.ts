import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { BoardEventsService } from './board-events.service';
import { BoardsService } from './boards.service';

@Controller('api/boards/:id/stream')
export class StreamController {
  constructor(
    private boardEvents: BoardEventsService,
    private boardsService: BoardsService,
    private jwtService: JwtService,
  ) {}

  @Get()
  async stream(
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    let userId: string | null = null;
    
    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        userId = payload.sub;
      } catch {}
    }

    const role = await this.boardsService.getMemberRole(id, userId!);
    if (!role) {
      res.status(403).end();
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const unsubscribe = this.boardEvents.subscribe(id, (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    res.on('close', unsubscribe);
  }
}
