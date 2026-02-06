import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BoardsService } from './boards.service';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => 
  (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(ROLES_KEY, roles, descriptor?.value ?? target);
  };

@Injectable()
export class BoardAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private boardsService: BoardsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const boardId = request.params.id || request.params.boardId;
    const user = request.user;

    if (!boardId) return true;

    const role = await this.boardsService.getMemberRole(boardId, user?.id, user?.email);
    if (!role) throw new ForbiddenException('No access to this board');

    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    request.boardRole = role;
    return true;
  }
}
