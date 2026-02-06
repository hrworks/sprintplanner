export interface Phase {
  _id: string;
  name: string;
  subtitle?: string;
  description?: string;
  link?: string;
  start: string;
  end: string;
  color: string;
  showStartLine?: boolean;
  showEndLine?: boolean;
  syncWith?: string[];
  _fieldUpdates?: Record<string, number>;
}

export interface Project {
  _id: string;
  name: string;
  category?: string;
  description?: string;
  link?: string;
  status?: '' | 'ok' | 'warning' | 'delay' | 'complete';
  color: string;
  locked?: boolean;
  phases: Phase[];
  _fieldUpdates?: Record<string, number>;
}

export interface Connection {
  _id: string;
  from: string;
  to: string;
}

export interface BoardData {
  projects: Project[];
  connections: Connection[];
  viewStart?: string;
  viewEnd?: string;
}

export interface CursorSettings {
  showMy: boolean;
  showOthers: boolean;
}

export interface RemoteUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
}

export interface RemoteCursor {
  userId: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

export const DEFAULT_COLORS = [
  '#e94560', '#00d9ff', '#ffc107', '#4ade80', '#8b5cf6',
  '#f97316', '#06b6d4', '#ec4899', '#84cc16', '#a855f7',
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6366f1'
];

export const STATUS_ICONS: Record<string, string> = {
  'ok': 'ok',
  'warning': 'warning',
  'delay': 'delay',
  'complete': 'complete',
  '': ''
};

export const STATUS_COLORS: Record<string, string> = {
  'ok': '#10b981',
  'warning': '#f59e0b',
  'delay': '#ef4444',
  'complete': '#6366f1',
  '': 'transparent'
};
