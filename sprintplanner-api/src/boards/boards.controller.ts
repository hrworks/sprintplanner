import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Req, UseGuards, ForbiddenException,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { JwtAuthGuard, OptionalAuthGuard } from '../auth/guards';

@Controller('api/boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: any) {
    return this.boardsService.findAll(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body('name') name: string) {
    if (req.user.role === 'viewer') throw new ForbiddenException('Viewers cannot create boards');
    return this.boardsService.create(req.user.id, name || 'Neues Board');
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async findOne(@Param('id') id: string, @Req() req: any) {
    const role = await this.boardsService.getMemberRole(id, req.user?.id, req.user?.email);
    if (!role) throw new ForbiddenException();
    const board = await this.boardsService.findOne(id);
    return { ...board, role };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    const role = await this.boardsService.getMemberRole(id, req.user.id, req.user.email);
    if (!role || role === 'viewer') throw new ForbiddenException();
    return this.boardsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    const role = await this.boardsService.getMemberRole(id, req.user.id, req.user.email);
    if (role !== 'owner') throw new ForbiddenException();
    await this.boardsService.delete(id);
    return { success: true };
  }

  @Patch(':id/visibility')
  @UseGuards(JwtAuthGuard)
  async setVisibility(@Param('id') id: string, @Req() req: any, @Body('isPublic') isPublic: boolean) {
    const role = await this.boardsService.getMemberRole(id, req.user.id, req.user.email);
    if (role !== 'owner') throw new ForbiddenException();
    return this.boardsService.update(id, { isPublic });
  }
}
