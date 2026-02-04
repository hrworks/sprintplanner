import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { BoardAccessGuard } from './board-access.guard';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { InviteController } from './invite.controller';
import { BoardEventsService } from './board-events.service';
import { StreamController } from './stream.controller';
import { ActionsController } from './actions.controller';
import { CursorGateway } from './cursor.gateway';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [BoardsController, MembersController, InviteController, StreamController, ActionsController],
  providers: [BoardsService, BoardAccessGuard, MembersService, BoardEventsService, CursorGateway],
  exports: [BoardsService, BoardEventsService],
})
export class BoardsModule {}
