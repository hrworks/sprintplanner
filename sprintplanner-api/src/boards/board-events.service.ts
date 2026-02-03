import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class BoardEventsService {
  private emitter = new EventEmitter();

  emit(boardId: string, event: string, data: any) {
    this.emitter.emit(`board:${boardId}`, { event, data });
  }

  subscribe(boardId: string, callback: (data: any) => void) {
    this.emitter.on(`board:${boardId}`, callback);
    return () => this.emitter.off(`board:${boardId}`, callback);
  }
}
