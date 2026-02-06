import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Req, UseGuards, ForbiddenException,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { BoardsService } from './boards.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('api/boards/:boardId/members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(
    private membersService: MembersService,
    private boardsService: BoardsService,
  ) {}

  private async requireOwner(boardId: string, userId: string) {
    const role = await this.boardsService.getMemberRole(boardId, userId);
    if (role !== 'owner') throw new ForbiddenException();
  }

  @Get()
  async findAll(@Param('boardId') boardId: string, @Req() req: any) {
    const role = await this.boardsService.getMemberRole(boardId, req.user.id, req.user.email);
    if (!role) throw new ForbiddenException();
    return this.membersService.findAll(boardId);
  }

  @Post()
  async invite(
    @Param('boardId') boardId: string,
    @Body() body: { email: string; role: 'editor' | 'viewer' },
    @Req() req: any,
  ) {
    await this.requireOwner(boardId, req.user.id);
    return this.membersService.invite(boardId, body.email, body.role, { id: req.user.id, name: req.user.name });
  }

  @Patch(':memberId')
  async updateRole(
    @Param('boardId') boardId: string,
    @Param('memberId') memberId: string,
    @Body('role') role: 'editor' | 'viewer',
    @Req() req: any,
  ) {
    await this.requireOwner(boardId, req.user.id);
    await this.membersService.updateRole(memberId, role);
    return { success: true };
  }

  @Delete(':memberId')
  async remove(
    @Param('boardId') boardId: string,
    @Param('memberId') memberId: string,
    @Req() req: any,
  ) {
    await this.requireOwner(boardId, req.user.id);
    await this.membersService.remove(memberId);
    return { success: true };
  }
}
