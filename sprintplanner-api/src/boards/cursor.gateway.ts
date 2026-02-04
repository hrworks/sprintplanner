import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import { randomUUID } from 'crypto';

interface Client {
  ws: WebSocket;
  instanceId: string;  // Unique per connection
  userId: string;
  userName: string;
  userAvatar?: string;
  boardId?: string;
}

@Injectable()
export class CursorGateway implements OnModuleInit {
  private wss: WebSocketServer;
  private clients = new Map<WebSocket, Client>();

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private getAvatarColor(name: string): string {
    const colors = ['#e94560', '#4ade80', '#fbbf24', '#60a5fa', '#a78bfa', '#f472b6', '#34d399', '#fb923c'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  onModuleInit() {
    this.wss = new WebSocketServer({ port: 3001 });
    this.wss.on('connection', (ws, req) => this.handleConnection(ws, req));
    console.log('WebSocket server running on port 3001');
  }

  private async handleConnection(ws: WebSocket, req: IncomingMessage) {
    const token = new URL(req.url!, 'http://localhost').searchParams.get('token');
    
    try {
      const payload = this.jwtService.verify(token!);
      const client: Client = {
        ws,
        instanceId: randomUUID(),
        userId: payload.sub,
        userName: payload.name || payload.email?.split('@')[0] || 'User',
        userAvatar: payload.avatar,
      };
      this.clients.set(ws, client);

      // Send instance ID to client
      ws.send(JSON.stringify({ type: 'connected', instanceId: client.instanceId }));

      ws.on('message', (data) => this.handleMessage(client, data.toString()));
      ws.on('close', () => this.handleDisconnect(client));
    } catch {
      ws.close(4001, 'Unauthorized');
    }
  }

  private handleMessage(client: Client, raw: string) {
    const msg = JSON.parse(raw);

    switch (msg.type) {
      case 'join':
        client.boardId = msg.boardId;
        this.broadcastUsers(msg.boardId);
        break;

      case 'leave':
        if (client.boardId) {
          this.broadcastToBoard(client.boardId, { type: 'cursor_leave', instanceId: client.instanceId });
        }
        break;

      case 'cursor':
        if (client.boardId) {
          this.broadcastToBoard(client.boardId, {
            type: 'cursor',
            instanceId: client.instanceId,
            userId: client.userId,
            name: client.userName,
            color: this.getAvatarColor(client.userName),
            dayOffset: msg.dayOffset,
            y: msg.y,
          }, client.instanceId);
        }
        break;

      case 'selection':
        if (client.boardId) {
          this.broadcastToBoard(client.boardId, {
            type: 'selection',
            instanceId: client.instanceId,
            phaseId: msg.phaseId,
            color: this.getAvatarColor(client.userName),
          }, client.instanceId);
        }
        break;
    }
  }

  private handleDisconnect(client: Client) {
    if (client.boardId) {
      this.broadcastToBoard(client.boardId, { type: 'cursor_leave', instanceId: client.instanceId });
      this.broadcastUsers(client.boardId);
    }
    this.clients.delete(client.ws);
  }

  private broadcastToBoard(boardId: string, data: any, excludeInstanceId?: string) {
    const msg = JSON.stringify(data);
    this.clients.forEach((c) => {
      if (c.boardId === boardId && c.instanceId !== excludeInstanceId && c.ws.readyState === WebSocket.OPEN) {
        c.ws.send(msg);
      }
    });
  }

  private broadcastUsers(boardId: string) {
    // Send all instances, not just unique users
    const users = Array.from(this.clients.values())
      .filter((c) => c.boardId === boardId)
      .map((c) => ({ 
        id: c.instanceId,  // Use instanceId as unique identifier
        odId: c.userId,
        name: c.userName, 
        avatar: c.userAvatar 
      }));
    
    this.broadcastToBoard(boardId, { type: 'users', boardId, users });
  }
}
