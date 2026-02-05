import { Controller, Post, Param, Body, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardEventsService } from './board-events.service';
import { JwtAuthGuard } from '../auth/guards';

// Simple mutex per board to prevent race conditions
const boardLocks = new Map<string, Promise<void>>();
async function withLock<T>(boardId: string, fn: () => Promise<T>): Promise<T> {
  const prev = boardLocks.get(boardId) || Promise.resolve();
  let resolve: () => void;
  const next = new Promise<void>(r => resolve = r);
  boardLocks.set(boardId, next);
  await prev;
  try {
    return await fn();
  } finally {
    resolve!();
  }
}

export type BoardAction =
  | { type: 'addProject'; project: any }
  | { type: 'updateProject'; projectId: string; updates: any }
  | { type: 'deleteProject'; projectId: string }
  | { type: 'reorderProjects'; fromIndex: number; toIndex: number }
  | { type: 'addPhase'; projectId: string; phase: any }
  | { type: 'updatePhase'; phaseId: string; updates: any }
  | { type: 'deletePhase'; projectId: string; phaseId: string }
  | { type: 'movePhase'; fromProjectId: string; toProjectId: string; phaseId: string }
  | { type: 'addConnection'; connection: any }
  | { type: 'deleteConnection'; connectionId: string }
  | { type: 'setDateRange'; viewStart: string; viewEnd: string };

@Controller('api/boards/:id/actions')
export class ActionsController {
  constructor(
    private boardsService: BoardsService,
    private boardEvents: BoardEventsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async applyAction(
    @Param('id') boardId: string,
    @Req() req: any,
    @Body() body: { action: BoardAction; clientId: string },
  ) {
    console.log('Received action:', body.action.type, 'for board:', boardId);
    const role = await this.boardsService.getMemberRole(boardId, req.user.id);
    if (!role || role === 'viewer') throw new ForbiddenException();

    return withLock(boardId, async () => {
      const board = await this.boardsService.findOne(boardId);
      if (!board) throw new ForbiddenException();

      const data = JSON.parse(board.data || '{"projects":[],"connections":[]}');
      const newData = applyAction(data, body.action);
      console.log('After action, projects:', newData.projects?.length, 'connections:', newData.connections?.length);

      await this.boardsService.updateData(boardId, JSON.stringify(newData));
      this.boardEvents.emit(boardId, 'action', { action: body.action, clientId: body.clientId });

      return { success: true };
    });
  }
}

function applyAction(data: any, action: BoardAction): any {
  switch (action.type) {
    case 'addProject':
      return { ...data, projects: [...data.projects, action.project] };

    case 'updateProject':
      return {
        ...data,
        projects: data.projects.map((p: any) =>
          p._id === action.projectId ? { ...p, ...action.updates } : p
        ),
      };

    case 'deleteProject':
      return { ...data, projects: data.projects.filter((p: any) => p._id !== action.projectId) };

    case 'reorderProjects': {
      const projects = [...data.projects];
      const [moved] = projects.splice(action.fromIndex, 1);
      projects.splice(action.toIndex, 0, moved);
      return { ...data, projects };
    }

    case 'addPhase':
      return {
        ...data,
        projects: data.projects.map((p: any) =>
          p._id === action.projectId ? { ...p, phases: [...p.phases, action.phase] } : p
        ),
      };

    case 'updatePhase':
      return {
        ...data,
        projects: data.projects.map((p: any) => ({
          ...p,
          phases: p.phases.map((ph: any) =>
            ph._id === action.phaseId ? { ...ph, ...action.updates } : ph
          ),
        })),
      };

    case 'deletePhase':
      return {
        ...data,
        projects: data.projects.map((p: any) =>
          p._id === action.projectId ? { ...p, phases: p.phases.filter((ph: any) => ph._id !== action.phaseId) } : p
        ),
        connections: data.connections.filter((c: any) => c.from !== action.phaseId && c.to !== action.phaseId),
      };

    case 'movePhase': {
      const fromProject = data.projects.find((p: any) => p._id === action.fromProjectId);
      const phase = fromProject?.phases.find((ph: any) => ph._id === action.phaseId);
      if (!phase) return data;
      return {
        ...data,
        projects: data.projects.map((p: any) => {
          if (p._id === action.fromProjectId) return { ...p, phases: p.phases.filter((ph: any) => ph._id !== action.phaseId) };
          if (p._id === action.toProjectId) return { ...p, phases: [...p.phases, phase] };
          return p;
        }),
      };
    }

    case 'addConnection':
      return { ...data, connections: [...data.connections, action.connection] };

    case 'deleteConnection':
      return { ...data, connections: data.connections.filter((c: any) => c._id !== action.connectionId) };

    case 'setDateRange':
      return { ...data, viewStart: action.viewStart, viewEnd: action.viewEnd };

    default:
      return data;
  }
}
