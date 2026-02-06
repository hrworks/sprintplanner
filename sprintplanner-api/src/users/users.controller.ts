import { Controller, Get, Post, Delete, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards';
import { AdminGuard } from '../auth/admin.guard';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(AdminGuard)
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Post('invite')
  @UseGuards(AdminGuard)
  inviteUser(@Body() body: { email: string }) {
    return this.usersService.inviteUser(body.email);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Patch(':id/role')
  @UseGuards(AdminGuard)
  updateRole(@Param('id') id: string, @Body() body: { role: 'admin' | 'user' | 'viewer' }) {
    return this.usersService.updateRole(id, body.role);
  }

  @Get(':id/boards')
  @UseGuards(AdminGuard)
  getUserBoards(@Param('id') id: string) {
    return this.usersService.getUserBoards(id);
  }

  @Get('me/settings')
  getSettings(@Req() req: any) {
    return this.usersService.getSettings(req.user.id);
  }

  @Patch('me/settings')
  updateSettings(@Req() req: any, @Body() body: { showMyCursor?: boolean; showOtherCursors?: boolean }) {
    return this.usersService.updateSettings(req.user.id, body);
  }
}
