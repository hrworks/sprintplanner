import { create } from 'zustand';
import { BoardData, Project, Phase, Connection, CursorSettings, RemoteUser, RemoteCursor } from './types';

interface GanttState {
  // Board data
  boardId: string | null;
  boardName: string;
  boardRole: 'owner' | 'editor' | 'viewer' | null;
  data: BoardData;
  
  // UI state
  selectedProjectId: string | null;
  selectedPhaseId: string | null;
  expandedProjects: Set<string>;
  showDetailPanel: boolean;
  showConnections: boolean;
  
  // Chart settings
  dayWidth: number;
  rowHeight: number;
  chartStartDate: Date;
  chartEndDate: Date;
  
  // Cursor settings
  cursorSettings: CursorSettings;
  activeUsers: RemoteUser[];
  remoteCursors: Map<string, RemoteCursor>;
  
  // Actions
  setBoard: (id: string, name: string, role: 'owner' | 'editor' | 'viewer', data: BoardData) => void;
  setData: (data: BoardData) => void;
  updateData: (updater: (data: BoardData) => BoardData) => void;
  
  selectProject: (id: string | null) => void;
  selectPhase: (projectId: string, phaseId: string) => void;
  toggleProjectExpanded: (id: string) => void;
  toggleDetailPanel: () => void;
  toggleConnections: () => void;
  
  setDayWidth: (width: number) => void;
  setRowHeight: (height: number) => void;
  setDateRange: (start: Date, end: Date) => void;
  
  setCursorSettings: (settings: CursorSettings) => void;
  setActiveUsers: (users: RemoteUser[]) => void;
  updateRemoteCursor: (cursor: RemoteCursor) => void;
  removeRemoteCursor: (userId: string) => void;
  
  // Project/Phase CRUD
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;
  
  addPhase: (projectId: string, phase: Phase) => void;
  updatePhase: (phaseId: string, updates: Partial<Phase>) => void;
  deletePhase: (projectId: string, phaseId: string) => void;
  movePhase: (fromProjectId: string, toProjectId: string, phaseId: string) => void;
  
  addConnection: (conn: Connection) => void;
  deleteConnection: (id: string) => void;
}

const generateId = (prefix = '') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return prefix ? `${prefix}-${id}` : id;
};

export const useGanttStore = create<GanttState>((set) => ({
  boardId: null,
  boardName: '',
  boardRole: null,
  data: { projects: [], connections: [] },
  
  selectedProjectId: null,
  selectedPhaseId: null,
  expandedProjects: new Set(),
  showDetailPanel: false,
  showConnections: true,
  
  dayWidth: 20,
  rowHeight: 45,
  chartStartDate: new Date(new Date().getFullYear(), 0, 1),
  chartEndDate: new Date(new Date().getFullYear(), 11, 31),
  
  cursorSettings: { showMy: true, showOthers: true },
  activeUsers: [],
  remoteCursors: new Map(),
  
  setBoard: (id, name, role, data) => {
    // Load user settings for this board from localStorage
    const savedSettings = localStorage.getItem(`board-settings-${id}`);
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    set({ 
      boardId: id, 
      boardName: name, 
      boardRole: role, 
      data,
      dayWidth: settings.dayWidth || 20,
      rowHeight: settings.rowHeight || 45
    });
  },
  setData: (data) => set({ data }),
  updateData: (updater) => set(state => ({ data: updater(state.data) })),
  
  selectProject: (id) => set({ selectedProjectId: id, selectedPhaseId: null }),
  selectPhase: (projectId, phaseId) => set({ selectedProjectId: projectId, selectedPhaseId: phaseId, showDetailPanel: true }),
  toggleProjectExpanded: (id) => set(state => {
    const expanded = new Set(state.expandedProjects);
    expanded.has(id) ? expanded.delete(id) : expanded.add(id);
    return { expandedProjects: expanded, selectedProjectId: id };
  }),
  toggleDetailPanel: () => set(state => ({ showDetailPanel: !state.showDetailPanel })),
  toggleConnections: () => set(state => ({ showConnections: !state.showConnections })),
  
  setDayWidth: (dayWidth) => set(state => {
    if (state.boardId) {
      const saved = JSON.parse(localStorage.getItem(`board-settings-${state.boardId}`) || '{}');
      localStorage.setItem(`board-settings-${state.boardId}`, JSON.stringify({ ...saved, dayWidth }));
    }
    return { dayWidth };
  }),
  setRowHeight: (rowHeight) => set(state => {
    if (state.boardId) {
      const saved = JSON.parse(localStorage.getItem(`board-settings-${state.boardId}`) || '{}');
      localStorage.setItem(`board-settings-${state.boardId}`, JSON.stringify({ ...saved, rowHeight }));
    }
    return { rowHeight };
  }),
  setDateRange: (chartStartDate, chartEndDate) => set({ chartStartDate, chartEndDate }),
  
  setCursorSettings: (cursorSettings) => set({ cursorSettings }),
  setActiveUsers: (activeUsers) => set({ activeUsers }),
  updateRemoteCursor: (cursor) => set(state => {
    const cursors = new Map(state.remoteCursors);
    cursors.set(cursor.userId, cursor);
    return { remoteCursors: cursors };
  }),
  removeRemoteCursor: (userId) => set(state => {
    const cursors = new Map(state.remoteCursors);
    cursors.delete(userId);
    return { remoteCursors: cursors };
  }),
  
  addProject: (project) => set(state => ({
    data: { ...state.data, projects: [...state.data.projects, { ...project, _id: project._id || generateId('p') }] }
  })),
  updateProject: (id, updates) => set(state => ({
    data: {
      ...state.data,
      projects: state.data.projects.map(p => p._id === id ? { ...p, ...updates } : p)
    }
  })),
  deleteProject: (id) => set(state => ({
    data: { ...state.data, projects: state.data.projects.filter(p => p._id !== id) }
  })),
  reorderProjects: (fromIndex, toIndex) => set(state => {
    const projects = [...state.data.projects];
    const [moved] = projects.splice(fromIndex, 1);
    projects.splice(toIndex, 0, moved);
    return { data: { ...state.data, projects } };
  }),
  
  addPhase: (projectId, phase) => set(state => ({
    data: {
      ...state.data,
      projects: state.data.projects.map(p => 
        p._id === projectId 
          ? { ...p, phases: [...p.phases, { ...phase, _id: phase._id || generateId('ph') }] }
          : p
      )
    }
  })),
  updatePhase: (phaseId, updates) => set(state => ({
    data: {
      ...state.data,
      projects: state.data.projects.map(p => ({
        ...p,
        phases: p.phases.map(ph => ph._id === phaseId ? { ...ph, ...updates } : ph)
      }))
    }
  })),
  deletePhase: (projectId, phaseId) => set(state => ({
    data: {
      ...state.data,
      projects: state.data.projects.map(p => 
        p._id === projectId ? { ...p, phases: p.phases.filter(ph => ph._id !== phaseId) } : p
      ),
      connections: state.data.connections.filter(c => c.from !== phaseId && c.to !== phaseId)
    }
  })),
  movePhase: (fromProjectId, toProjectId, phaseId) => set(state => {
    const fromProject = state.data.projects.find(p => p._id === fromProjectId);
    const phase = fromProject?.phases.find(ph => ph._id === phaseId);
    if (!phase) return state;
    
    return {
      data: {
        ...state.data,
        projects: state.data.projects.map(p => {
          if (p._id === fromProjectId) return { ...p, phases: p.phases.filter(ph => ph._id !== phaseId) };
          if (p._id === toProjectId) return { ...p, phases: [...p.phases, phase] };
          return p;
        })
      }
    };
  }),
  
  addConnection: (conn) => set(state => ({
    data: {
      ...state.data,
      connections: [...state.data.connections, { ...conn, _id: conn._id || generateId('conn') }]
    }
  })),
  deleteConnection: (id) => set(state => ({
    data: { ...state.data, connections: state.data.connections.filter(c => c._id !== id) }
  })),
}));

export { generateId };
