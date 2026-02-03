import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class FrontendController {
  @Get('board/:id')
  board(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'board.html'));
  }
}
