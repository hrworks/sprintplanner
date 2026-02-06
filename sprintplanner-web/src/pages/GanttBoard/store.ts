import { create } from 'zustand';
import { BoardData, Project, Phase, Connection, CursorSettings, RemoteUser, RemoteCursor } from './types';

// Unique client ID for this browser tab
export const clientId = Math.random().toString(36).slice(2);

// Action queue for syncing
export const actionQueue: any[] = [];

interface GanttState {
  // Board data
  boardId: string | null;
  boardName: string;
  boardDescription: string;
  boardRole: 'owner' | 'editor' | 'viewer' | null;
  data: BoardData;
  
  // UI state
  selectedProjectId: string | null;
  selectedPhaseId: string | null;
  expandedProjects: Set<string>;
  showDetailPanel: boolean;
  showConnections: boolean;
  sidebarCollapsed: boolean;
  topbarCollapsed: boolean;
  
  // Chart settings
  dayWidth: number;
  rowHeight: number;
  chartStartDate: Date;
  chartEndDate: Date;
  
  // Cursor settings
  cursorSettings: CursorSettings;
  activeUsers: RemoteUser[];
  remoteCursors: Map<string, RemoteCursor>;
  remoteSelections: Map<string, { phaseId: string; color: string }>;
  
  // Actions
  setBoard: (id: string, name: string, role: 'owner' | 'editor' | 'viewer', data: BoardData) => void;
  setBoardDescription: (description: string) => void;
  setData: (data: BoardData) => void;
  updateData: (updater: (data: BoardData) => BoardData) => void;
  importData: (data: BoardData) => void;
  
  selectProject: (id: string | null) => void;
  selectPhase: (projectId: string, phaseId: string, openPanel?: boolean) => void;
  toggleProjectExpanded: (id: string) => void;
  toggleDetailPanel: () => void;
  toggleConnections: () => void;
  toggleSidebar: () => void;
  toggleTopbar: () => void;
  
  setDayWidth: (width: number) => void;
  setRowHeight: (height: number) => void;
  setDateRange: (start: Date, end: Date) => void;
  
  setCursorSettings: (settings: CursorSettings) => void;
  setActiveUsers: (users: RemoteUser[]) => void;
  updateRemoteCursor: (cursor: RemoteCursor) => void;
  removeRemoteCursor: (userId: string) => void;
  setRemoteSelection: (instanceId: string, phaseId: string | null, color: string) => void;
  
  // Project/Phase CRUD
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;
  
  addPhase: (projectId: string, phase: Phase) => void;
  updatePhase: (phaseId: string, updates: Partial<Phase>) => void;
  updatePhaseLocal: (phaseId: string, updates: Partial<Phase>) => void;
  deletePhase: (projectId: string, phaseId: string) => void;
  movePhase: (fromProjectId: string, toProjectId: string, phaseId: string) => void;
  movePhaseLocal: (fromProjectId: string, toProjectId: string, phaseId: string) => void;
  
  addConnection: (conn: Connection) => void;
  deleteConnection: (id: string) => void;
  
  // Sync functions
  syncPhases: (phaseIds: string[]) => void;
  unsyncPhase: (phaseId: string) => void;
  
  // Multi-select
  selectedPhaseIds: Set<string>;
  togglePhaseSelection: (phaseId: string) => void;
  clearSelection: () => void;
}

const generateId = (prefix = '') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return prefix ? `${prefix}-${id}` : id;
};

export const useGanttStore = create<GanttState>((set, get) => ({
  boardId: null,
  boardName: '',
  boardDescription: '',
  boardRole: null,
  data: { projects: [], connections: [] },
  
  selectedProjectId: null,
  selectedPhaseId: null,
  selectedPhaseIds: new Set(),
  expandedProjects: new Set(),
  showDetailPanel: false,
  showConnections: true,
  sidebarCollapsed: false,
  topbarCollapsed: false,
  
  dayWidth: 20,
  rowHeight: 45,
  chartStartDate: new Date(new Date().getFullYear(), 0, 1),
  chartEndDate: new Date(new Date().getFullYear(), 11, 31),
  
  cursorSettings: { showMy: true, showOthers: true },
  activeUsers: [],
  remoteCursors: new Map(),
  remoteSelections: new Map(),
  
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
  setBoardDescription: (description) => set({ boardDescription: description }),
  setData: (data) => set({ data }),
  updateData: (updater) => set(state => ({ data: updater(state.data) })),
  
  // Import data and sync to server
  importData: (imported: BoardData) => {
    // Queue actions for each project
    imported.projects.forEach(project => {
      console.log('Queueing addProject:', project.name);
      actionQueue.push({ type: 'addProject', project });
    });
    imported.connections?.forEach(conn => {
      actionQueue.push({ type: 'addConnection', connection: conn });
    });
    if (imported.viewStart && imported.viewEnd) {
      actionQueue.push({ type: 'setDateRange', viewStart: imported.viewStart, viewEnd: imported.viewEnd });
    }
    console.log('Action queue length:', actionQueue.length);
    set(state => ({
      data: {
        projects: [...state.data.projects, ...imported.projects],
        connections: [...state.data.connections, ...(imported.connections || [])],
        viewStart: imported.viewStart || state.data.viewStart,
        viewEnd: imported.viewEnd || state.data.viewEnd
      }
    }));
  },
  
  selectProject: (id) => set({ selectedProjectId: id, selectedPhaseId: null }),
  selectPhase: (projectId, phaseId, openPanel = true) => set({ selectedProjectId: projectId, selectedPhaseId: phaseId, showDetailPanel: openPanel ? true : undefined }),
  toggleProjectExpanded: (id) => set(state => {
    const expanded = new Set(state.expandedProjects);
    expanded.has(id) ? expanded.delete(id) : expanded.add(id);
    return { expandedProjects: expanded, selectedProjectId: id };
  }),
  toggleDetailPanel: () => set(state => ({ showDetailPanel: !state.showDetailPanel })),
  toggleConnections: () => set(state => ({ showConnections: !state.showConnections })),
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleTopbar: () => set(state => ({ topbarCollapsed: !state.topbarCollapsed })),
  
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
  setDateRange: (chartStartDate, chartEndDate) => {
    const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    actionQueue.push({ type: 'setDateRange', viewStart: formatDate(chartStartDate), viewEnd: formatDate(chartEndDate) });
    set({ chartStartDate, chartEndDate });
  },
  
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
  setRemoteSelection: (instanceId, phaseId, color) => set(state => {
    const selections = new Map(state.remoteSelections);
    if (phaseId) {
      selections.set(instanceId, { phaseId, color });
    } else {
      selections.delete(instanceId);
    }
    return { remoteSelections: selections };
  }),
  
  addProject: (project) => {
    const newProject = { ...project, _id: project._id || generateId('p') };
    actionQueue.push({ type: 'addProject', project: newProject });
    set(state => ({
      data: { ...state.data, projects: [...state.data.projects, newProject] }
    }));
  },
  updateProject: (id, updates) => {
    actionQueue.push({ type: 'updateProject', projectId: id, updates });
    set(state => ({
      data: {
        ...state.data,
        projects: state.data.projects.map(p => p._id === id ? { ...p, ...updates } : p)
      }
    }));
  },
  deleteProject: (id) => {
    actionQueue.push({ type: 'deleteProject', projectId: id });
    set(state => ({
      data: { ...state.data, projects: state.data.projects.filter(p => p._id !== id) }
    }));
  },
  reorderProjects: (fromIndex, toIndex) => {
    actionQueue.push({ type: 'reorderProjects', fromIndex, toIndex });
    set(state => {
      const projects = [...state.data.projects];
      const [moved] = projects.splice(fromIndex, 1);
      projects.splice(toIndex, 0, moved);
      return { data: { ...state.data, projects } };
    });
  },
  
  addPhase: (projectId, phase) => {
    const newPhase = { ...phase, _id: phase._id || generateId('ph') };
    actionQueue.push({ type: 'addPhase', projectId, phase: newPhase });
    set(state => ({
      data: {
        ...state.data,
        projects: state.data.projects.map(p => 
          p._id === projectId 
            ? { ...p, phases: [...p.phases, newPhase] }
            : p
        )
      }
    }));
  },
  updatePhase: (phaseId, updates) => {
    actionQueue.push({ type: 'updatePhase', phaseId, updates });
    set(state => ({
      data: {
        ...state.data,
        projects: state.data.projects.map(p => ({
          ...p,
          phases: p.phases.map(ph => ph._id === phaseId ? { ...ph, ...updates } : ph)
        }))
      }
    }));
  },
  updatePhaseLocal: (phaseId, updates) => {
    // Local only - no action queued (for dragging)
    set(state => ({
      data: {
        ...state.data,
        projects: state.data.projects.map(p => ({
          ...p,
          phases: p.phases.map(ph => ph._id === phaseId ? { ...ph, ...updates } : ph)
        }))
      }
    }));
  },
  deletePhase: (projectId, phaseId) => {
    actionQueue.push({ type: 'deletePhase', projectId, phaseId });
    set(state => ({
      data: {
        ...state.data,
        projects: state.data.projects.map(p => 
          p._id === projectId ? { ...p, phases: p.phases.filter(ph => ph._id !== phaseId) } : p
        ),
        connections: state.data.connections.filter(c => c.from !== phaseId && c.to !== phaseId)
      }
    }));
  },
  movePhase: (fromProjectId, toProjectId, phaseId) => {
    actionQueue.push({ type: 'movePhase', fromProjectId, toProjectId, phaseId });
    set(state => {
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
    });
  },
  movePhaseLocal: (fromProjectId, toProjectId, phaseId) => {
    // Local only - no action queued (for dragging)
    set(state => {
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
    });
  },
  
  addConnection: (conn) => {
    const newConn = { ...conn, _id: conn._id || generateId('conn') };
    actionQueue.push({ type: 'addConnection', connection: newConn });
    set(state => ({
      data: {
        ...state.data,
        connections: [...state.data.connections, newConn]
      }
    }));
  },
  deleteConnection: (id) => {
    actionQueue.push({ type: 'deleteConnection', connectionId: id });
    set(state => ({
      data: { ...state.data, connections: state.data.connections.filter(c => c._id !== id) }
    }));
  },
  
  // Multi-select
  togglePhaseSelection: (phaseId) => set(state => {
    const selected = new Set(state.selectedPhaseIds);
    
    // If there's a single selection, add it to multi-select first
    if (state.selectedPhaseId && !selected.has(state.selectedPhaseId)) {
      selected.add(state.selectedPhaseId);
    }
    
    // Toggle the clicked phase
    if (selected.has(phaseId)) {
      selected.delete(phaseId);
    } else {
      selected.add(phaseId);
    }
    
    return { selectedPhaseIds: selected, selectedPhaseId: null, showDetailPanel: false };
  }),
  clearSelection: () => set({ selectedPhaseIds: new Set() }),
  
  // Sync functions
  syncPhases: (phaseIds) => {
    // Collect all existing sync partners
    const allIds = new Set(phaseIds);
    const { data } = get();
    data.projects.forEach(p => p.phases.forEach(ph => {
      if (phaseIds.includes(ph._id) && ph.syncWith) {
        ph.syncWith.forEach(id => allIds.add(id));
      }
    }));
    
    const syncArray = Array.from(allIds);
    actionQueue.push({ type: 'syncPhases', phaseIds: syncArray });
    
    set(state => ({
      data: {
        ...state.data,
        projects: state.data.projects.map(p => ({
          ...p,
          phases: p.phases.map(ph => 
            allIds.has(ph._id) 
              ? { ...ph, syncWith: syncArray.filter(id => id !== ph._id) }
              : ph
          )
        }))
      },
      selectedPhaseIds: new Set()
    }));
  },
  
  unsyncPhase: (phaseId) => {
    actionQueue.push({ type: 'unsyncPhase', phaseId });
    set(state => ({
      data: {
        ...state.data,
        projects: state.data.projects.map(p => ({
          ...p,
          phases: p.phases.map(ph => {
            if (ph._id === phaseId) {
              return { ...ph, syncWith: undefined };
            }
            if (ph.syncWith?.includes(phaseId)) {
              const newSync = ph.syncWith.filter(id => id !== phaseId);
              return { ...ph, syncWith: newSync.length ? newSync : undefined };
            }
            return ph;
          })
        }))
      }
    }));
  },
}));

export { generateId };
