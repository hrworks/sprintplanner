import styled from '@emotion/styled';
import { RefObject, useState, useCallback, useEffect, useMemo } from 'react';
import { useStore } from '@/store';
import { useGanttStore, generateId } from '../store';
import { getColors } from '@/styles';
import { Phase, DEFAULT_COLORS, STATUS_ICONS } from '../types';
import { ConfirmModal } from './ConfirmModal';

const StyledScrollContainer = styled.div<{ $mode: string }>`
  flex: 1;
  overflow: auto;
  position: relative;
  
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-track {
    background: ${p => getColors(p.$mode as 'dark' | 'light').bgPrimary};
  }
  &::-webkit-scrollbar-thumb {
    background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary};
    border-radius: 5px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${p => getColors(p.$mode as 'dark' | 'light').accent};
  }
  &::-webkit-scrollbar-corner {
    background: ${p => getColors(p.$mode as 'dark' | 'light').bgPrimary};
  }
`;

// Hook for horizontal scroll with mouse wheel and Shift+wheel for zoom
const useHorizontalScroll = (ref: RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const handleWheel = (e: WheelEvent) => {
      // Shift+wheel = zoom
      if (e.shiftKey) {
        e.preventDefault();
        const { dayWidth, setDayWidth } = useGanttStore.getState();
        const delta = e.deltaY > 0 ? -2 : 2;
        const newWidth = Math.max(0.5, Math.min(60, dayWidth + delta));
        setDayWidth(newWidth);
        return;
      }
      // Only horizontal scroll if no vertical scrollbar
      if (el.scrollHeight <= el.clientHeight && e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [ref]);
};

// Hook for sticky phase labels
const useStickyLabels = (ref: RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const updateStickyLabels = () => {
      const scrollLeft = el.scrollLeft;
      const labelsWidth = 220;
      const elRect = el.getBoundingClientRect();
      
      el.querySelectorAll<HTMLElement>('[data-phase]').forEach(bar => {
        if (!bar) return;
        const content = bar.querySelector<HTMLElement>('[data-content]');
        if (!content) return;
        
        const barRect = bar.getBoundingClientRect();
        if (!barRect.width) return;
        
        // Position relative to chart area (after labels)
        const barLeft = barRect.left - elRect.left - labelsWidth + scrollLeft;
        const barWidth = barRect.width;
        
        if (barLeft < scrollLeft && barLeft + barWidth > scrollLeft + 60) {
          const offset = scrollLeft - barLeft;
          const maxOffset = barWidth - 60;
          bar.style.paddingLeft = Math.min(offset, maxOffset) + 8 + 'px';
        } else {
          bar.style.paddingLeft = '8px';
        }
      });
    };
    
    el.addEventListener('scroll', updateStickyLabels);
    return () => el.removeEventListener('scroll', updateStickyLabels);
  }, [ref]);
};

const StyledWrapper = styled.div`
  display: flex;
  min-width: max-content;
`;

const StyledLabels = styled.div<{ $mode: string }>`
  width: 220px;
  flex-shrink: 0;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgSecondary};
  border-right: 2px solid ${p => getColors(p.$mode as 'dark' | 'light').accent};
  position: sticky;
  left: 0;
  z-index: 20;
`;

const StyledLabelHeader = styled.div<{ $mode: string }>`
  height: 50px;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary};
  border-bottom: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').bgPrimary};
  display: flex;
  align-items: center;
  padding: 0 15px;
  font-weight: 600;
  font-size: 12px;
  position: sticky;
  top: 0;
  z-index: 25;
`;

const StyledLabelRow = styled.div<{ $mode: string; $selected: boolean; $height: number }>`
  height: ${p => p.$height}px;
  border-bottom: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').border};
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 11px;
  cursor: pointer;
  gap: 6px;
  background: ${p => p.$selected ? getColors(p.$mode as 'dark' | 'light').bgTertiary : 'transparent'};
  border-left: ${p => p.$selected ? '3px solid #00d9ff' : 'none'};
  &:hover { background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary}; }
`;

const StyledChart = styled.div`
  flex: 1;
  position: relative;
`;

const StyledHeader = styled.div<{ $mode: string }>`
  height: 50px;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary};
  border-bottom: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').bgPrimary};
  display: flex;
  position: sticky;
  top: 0;
  z-index: 15;
`;

const StyledMonth = styled.div<{ $mode: string; $width: number }>`
  width: ${p => p.$width}px;
  border-right: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').bgPrimary};
  text-align: center;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const StyledMonthName = styled.div<{ $mode: string }>`
  padding: 5px 8px;
  font-weight: 600;
  font-size: 11px;
  border-bottom: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').bgPrimary};
  white-space: nowrap;
`;

const StyledDayRow = styled.div`
  display: flex;
  flex: 1;
`;

const StyledDayCell = styled.div<{ $mode: string; $width: number; $weekend: boolean; $today: boolean }>`
  width: ${p => p.$width}px;
  min-width: ${p => p.$width}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textSecondary};
  border-right: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').border};
  background: ${p => p.$today ? 'rgba(233, 69, 96, 0.3)' : p.$weekend ? 'rgba(233, 69, 96, 0.1)' : 'transparent'};
  font-weight: ${p => p.$today ? 'bold' : 'normal'};
`;

const StyledBody = styled.div<{ $width: number; $height: number }>`
  position: relative;
  width: ${p => p.$width}px;
  height: ${p => p.$height}px;
  user-select: none;
`;

const StyledRow = styled.div<{ $mode: string; $top: number; $width: number; $height: number; $color?: string }>`
  position: absolute;
  top: ${p => p.$top}px;
  width: ${p => p.$width}px;
  height: ${p => p.$height}px;
  border-bottom: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').border};
  background: ${p => p.$color ? `${p.$color}15` : 'transparent'};
  &:hover { background: rgba(233, 69, 96, 0.05); }
`;

const StyledTodayLine = styled.div<{ $left: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${p => p.$left}px;
  width: 2px;
  background: #e94560;
  z-index: 5;
  pointer-events: none;
`;

const StyledMilestoneLine = styled.div<{ $left: number; $color: string }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${p => p.$left}px;
  width: 2px;
  background: ${p => p.$color};
  z-index: 4;
  pointer-events: none;
  opacity: 0.8;
`;

const StyledPhaseBar = styled.div<{ $left: number; $width: number; $top: number; $height: number; $color: string; $selected: boolean; $remoteColor?: string }>`
  position: absolute;
  left: ${p => p.$left}px;
  width: ${p => p.$width}px;
  top: ${p => p.$top}px;
  height: ${p => p.$height}px;
  background: ${p => p.$color};
  border-radius: 4px;
  cursor: move;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  overflow: hidden;
  z-index: 10;
  box-shadow: ${p => p.$selected 
    ? '0 0 0 2px #fff, 0 0 15px rgba(0, 217, 255, 0.5)' 
    : p.$remoteColor 
      ? `0 0 0 3px ${p.$remoteColor}, 0 0 12px ${p.$remoteColor}` 
      : 'none'};
  &:hover { box-shadow: 0 0 12px rgba(255,255,255,0.4); z-index: 100; transform: scaleY(1.05); }
`;

const StyledBarContent = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const StyledBarTitle = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
`;

const StyledBarSubtitle = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 9px;
  opacity: 0.85;
  line-height: 1.2;
`;

const StyledResizeHandle = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10px;
  cursor: ew-resize;
  ${p => p.$side}: 0;
  border-radius: ${p => p.$side === 'left' ? '4px 0 0 4px' : '0 4px 4px 0'};
  &:hover { background: rgba(255,255,255,0.2); }
`;

const StyledCreatePreview = styled.div<{ $left: number; $width: number; $top: number; $height: number }>`
  position: absolute;
  left: ${p => p.$left}px;
  width: ${p => p.$width}px;
  top: ${p => p.$top}px;
  height: ${p => p.$height}px;
  border-radius: 4px;
  background: rgba(0, 217, 255, 0.4);
  border: 2px dashed #00d9ff;
  pointer-events: none;
  z-index: 50;
`;

const StyledDragTooltip = styled.div<{ $x: number; $y: number; $visible: boolean }>`
  position: fixed;
  left: ${p => p.$x}px;
  top: ${p => p.$y}px;
  background: #1a1a2e;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 9999;
  display: ${p => p.$visible ? 'block' : 'none'};
`;

const StyledConnector = styled.div<{ $side: 'left' | 'right'; $color: string }>`
  position: absolute;
  width: 12px;
  height: 12px;
  background: ${p => p.$color};
  border: 2px solid #fff;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  cursor: crosshair;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 200;
  ${p => p.$side}: -6px;
`;

const StyledPhaseBarWrapper = styled.div`
  &:hover .connector { opacity: 1; }
`;

const StyledContextMenu = styled.div<{ $x: number; $y: number; $mode: string }>`
  position: fixed;
  left: ${p => p.$x}px;
  top: ${p => p.$y}px;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgSecondary};
  border: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary};
  border-radius: 6px;
  padding: 4px 0;
  min-width: 160px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
`;

const StyledContextMenuItem = styled.div<{ $mode: string; $danger?: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  color: ${p => p.$danger ? '#e94560' : getColors(p.$mode as 'dark' | 'light').textPrimary};
  &:hover { background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary}; }
`;

const StyledConnectionSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
  overflow: visible;
`;

const StyledConnectionLine = styled.path`
  fill: none;
  stroke: #00d9ff;
  stroke-width: 2;
  opacity: 0.7;
  pointer-events: stroke;
  cursor: pointer;
  &:hover { stroke-width: 4; opacity: 1; }
`;

const StyledConnectionPreview = styled.path`
  fill: none;
  stroke: #e94560;
  stroke-width: 2;
  stroke-dasharray: 5,5;
`;

const StyledCategoryBadge = styled.span<{ $color: string }>`
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 9px;
  white-space: nowrap;
  color: white;
  background: ${p => p.$color};
  flex-shrink: 0;
  min-width: 12px;
  min-height: 12px;
`;

interface GanttChartProps {
  scrollRef: RefObject<HTMLDivElement>;
}

export const GanttChart = ({ scrollRef }: GanttChartProps) => {
  const { theme } = useStore();
  const { 
    data, dayWidth, rowHeight, chartStartDate, chartEndDate,
    selectedProjectId, selectedPhaseId, selectedPhaseIds, boardRole, showConnections, remoteSelections,
    selectProject, selectPhase, togglePhaseSelection, clearSelection,
    updatePhase, updatePhaseLocal, addPhase, addConnection, deleteConnection, deletePhase, movePhase, movePhaseLocal,
    syncPhases, unsyncPhase
  } = useGanttStore();

  // Build map of phaseId -> color for remote selections
  const remoteSelectionColors = useMemo(() => {
    const map = new Map<string, string>();
    remoteSelections.forEach(({ phaseId, color }) => {
      if (phaseId && !map.has(phaseId)) map.set(phaseId, color);
    });
    return map;
  }, [remoteSelections]);

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: 'connection' } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; phaseId: string; projectId: string } | null>(null);

  // Horizontal scroll with mouse wheel
  useHorizontalScroll(scrollRef);
  
  // Sticky phase labels
  useStickyLabels(scrollRef);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu]);

  // Delete selected phase with Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedProjectId && selectedPhaseId && boardRole !== 'viewer') {
        deletePhase(selectedProjectId, selectedPhaseId);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedProjectId, selectedPhaseId, boardRole, deletePhase]);

  // Helper to update phase and all synced phases
  const updatePhaseWithSync = useCallback((phaseId: string, updates: { start?: string; end?: string }) => {
    const phase = data.projects.flatMap(p => p.phases).find(ph => ph._id === phaseId);
    updatePhaseLocal(phaseId, updates);
    if (phase?.syncWith?.length) {
      phase.syncWith.forEach(syncId => updatePhaseLocal(syncId, updates));
    }
  }, [data.projects, updatePhaseLocal]);

  const [dragState, setDragState] = useState<{
    projectId: string;
    originalProjectId: string;
    phaseId: string;
    mode: 'move' | 'resize-left' | 'resize-right';
    startX: number;
    startY: number;
    originalStart: string;
    originalEnd: string;
    dragging: boolean;
  } | null>(null);

  const [createState, setCreateState] = useState<{
    projectId: string;
    startX: number;
    currentX: number;
    rowIndex: number;
  } | null>(null);

  const [connectionState, setConnectionState] = useState<{
    fromPhase: string;
    fromSide: 'left' | 'right';
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const parseDate = (str: string) => new Date(str + 'T12:00:00');
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const totalDays = Math.ceil((chartEndDate.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalWidth = totalDays * dayWidth;

  // Calculate lanes for overlapping phases
  const calculateLanes = (phases: Phase[]) => {
    const sorted = [...phases].sort((a, b) => parseDate(a.start).getTime() - parseDate(b.start).getTime());
    const lanes: { start: Date; end: Date; phaseId: string }[][] = [];
    const phaseToLane: Record<string, number> = {};
    
    for (const phase of sorted) {
      const start = parseDate(phase.start);
      const end = parseDate(phase.end);
      
      let placed = false;
      for (let i = 0; i < lanes.length; i++) {
        const lastInLane = lanes[i][lanes[i].length - 1];
        if (start > lastInLane.end) {
          lanes[i].push({ start, end, phaseId: phase._id });
          phaseToLane[phase._id] = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        lanes.push([{ start, end, phaseId: phase._id }]);
        phaseToLane[phase._id] = lanes.length - 1;
      }
    }
    
    // For each phase, find how many lanes overlap with it
    const phaseOverlapCount: Record<string, number> = {};
    for (const phase of phases) {
      const start = parseDate(phase.start);
      const end = parseDate(phase.end);
      let overlaps = 0;
      for (const lane of lanes) {
        for (const item of lane) {
          if (item.phaseId !== phase._id && !(end < item.start || start > item.end)) {
            overlaps++;
            break; // Only count one overlap per lane
          }
        }
      }
      phaseOverlapCount[phase._id] = overlaps + 1; // +1 for own lane
    }
    
    return { phaseToLane, laneCount: lanes.length, phaseOverlapCount };
  };

  const projectLanes = data.projects.map(p => calculateLanes(p.phases));
  const totalHeight = data.projects.length * rowHeight;
  const barPadding = 4;
  const barHeight = rowHeight - barPadding * 2;

  // Determine header granularity based on zoom level
  type HeaderMode = 'days' | 'months' | 'quarters' | 'years';
  const headerMode: HeaderMode = dayWidth >= 3 ? 'days' : dayWidth >= 1 ? 'quarters' : 'years';

  // Generate time periods for header based on mode
  const headerPeriods: { label: string; width: number; subLabel?: string }[] = [];
  
  if (headerMode === 'years') {
    let year = chartStartDate.getFullYear();
    while (year <= chartEndDate.getFullYear()) {
      const yearStart = new Date(Math.max(new Date(year, 0, 1).getTime(), chartStartDate.getTime()));
      const yearEnd = new Date(Math.min(new Date(year, 11, 31).getTime(), chartEndDate.getTime()));
      const days = Math.ceil((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      headerPeriods.push({ label: String(year), width: days * dayWidth });
      year++;
    }
  } else if (headerMode === 'quarters') {
    let current = new Date(chartStartDate);
    while (current <= chartEndDate) {
      const quarter = Math.floor(current.getMonth() / 3);
      const quarterStart = new Date(Math.max(new Date(current.getFullYear(), quarter * 3, 1).getTime(), chartStartDate.getTime()));
      const quarterEnd = new Date(Math.min(new Date(current.getFullYear(), quarter * 3 + 3, 0).getTime(), chartEndDate.getTime()));
      const days = Math.ceil((quarterEnd.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      headerPeriods.push({ label: `Q${quarter + 1}`, subLabel: String(current.getFullYear()), width: days * dayWidth });
      current = new Date(current.getFullYear(), (quarter + 1) * 3, 1);
    }
  } else {
    // months or days mode - generate months
    let current = new Date(chartStartDate);
    while (current <= chartEndDate) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startDay = current.getDate();
      const endOfMonth = new Date(year, month + 1, 0);
      const lastDay = endOfMonth > chartEndDate ? chartEndDate.getDate() : daysInMonth;
      const days = lastDay - startDay + 1;
      
      headerPeriods.push({
        label: current.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }),
        width: days * dayWidth,
        subLabel: headerMode === 'days' ? `${startDay}-${lastDay}` : undefined
      });
      
      current = new Date(year, month + 1, 1);
    }
  }

  // For day cells (only in days mode)
  const months: { name: string; days: number; startDay: number; monthIndex: number }[] = [];
  if (headerMode === 'days') {
    let current = new Date(chartStartDate);
    let monthIdx = 0;
    while (current <= chartEndDate) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startDay = current.getDate();
      const endOfMonth = new Date(year, month + 1, 0);
      const lastDay = endOfMonth > chartEndDate ? chartEndDate.getDate() : daysInMonth;
      const days = lastDay - startDay + 1;
      
      months.push({ name: '', days, startDay, monthIndex: monthIdx });
      current = new Date(year, month + 1, 1);
      monthIdx++;
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOffset = Math.ceil((today.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const showTodayLine = today >= chartStartDate && today <= chartEndDate;

  const handleRowMouseDown = (e: React.MouseEvent, projectId: string, rowIndex: number) => {
    if ((e.target as HTMLElement).closest('[data-phase]')) return;
    
    // Clear selection when clicking empty space
    if (selectedPhaseId) {
      selectProject(null);
    }
    
    if (boardRole === 'viewer') return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    setCreateState({ projectId, startX: x, currentX: x, rowIndex });
  };

  const handleBodyClick = (e: React.MouseEvent) => {
    // Clear selection when clicking empty space in body (not on a phase or row)
    if (!(e.target as HTMLElement).closest('[data-phase]') && !(e.target as HTMLElement).closest('[data-row]')) {
      if (selectedPhaseId) {
        selectProject(null);
      }
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (connectionState) {
      setConnectionState(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);
      return;
    }
    
    if (dragState) {
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      
      // Don't start dragging until threshold is exceeded
      if (!dragState.dragging && Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return;
      if (!dragState.dragging) {
        setDragState(prev => prev ? { ...prev, dragging: true } : null);
      }
      
      const deltaDays = Math.round(deltaX / dayWidth);
      
      const originalStart = parseDate(dragState.originalStart);
      const originalEnd = parseDate(dragState.originalEnd);
      
      const formatTooltipDate = (d: Date) => {
        const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        return `${days[d.getDay()]}, ${d.toLocaleDateString('de-DE')}`;
      };
      
      if (dragState.mode === 'move') {
        const newStart = new Date(originalStart);
        newStart.setDate(newStart.getDate() + deltaDays);
        const newEnd = new Date(originalEnd);
        newEnd.setDate(newEnd.getDate() + deltaDays);
        updatePhaseWithSync(dragState.phaseId, { start: formatDate(newStart), end: formatDate(newEnd) });
        
        // Check if dragging to different project row
        const ganttBody = document.querySelector('.gantt-body');
        if (ganttBody) {
          const rect = ganttBody.getBoundingClientRect();
          const relY = e.clientY - rect.top;
          const targetRowIdx = Math.floor(relY / rowHeight);
          if (targetRowIdx >= 0 && targetRowIdx < data.projects.length) {
            const targetProjectId = data.projects[targetRowIdx]._id;
            if (targetProjectId !== dragState.projectId) {
              movePhaseLocal(dragState.projectId, targetProjectId, dragState.phaseId);
              setDragState(prev => prev ? { ...prev, projectId: targetProjectId } : null);
            }
          }
        }
        
        setTooltip({ x: e.clientX + 10, y: e.clientY + 10, text: `${formatTooltipDate(newStart)} – ${formatTooltipDate(newEnd)}` });
      } else if (dragState.mode === 'resize-left') {
        const newStart = new Date(originalStart);
        newStart.setDate(newStart.getDate() + deltaDays);
        if (newStart < originalEnd) {
          updatePhaseWithSync(dragState.phaseId, { start: formatDate(newStart) });
          setTooltip({ x: e.clientX + 10, y: e.clientY + 10, text: formatTooltipDate(newStart) });
        }
      } else if (dragState.mode === 'resize-right') {
        const newEnd = new Date(originalEnd);
        newEnd.setDate(newEnd.getDate() + deltaDays);
        if (newEnd > originalStart) {
          updatePhaseWithSync(dragState.phaseId, { end: formatDate(newEnd) });
          setTooltip({ x: e.clientX + 10, y: e.clientY + 10, text: formatTooltipDate(newEnd) });
        }
      }
    }
    
    if (createState) {
      const rect = (e.currentTarget as HTMLElement).querySelector('.gantt-body')?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        setCreateState(prev => prev ? { ...prev, currentX: x } : null);
        
        const scrollLeft = scrollRef.current?.scrollLeft || 0;
        const left = Math.min(createState.startX, x) + scrollLeft;
        const width = Math.abs(x - createState.startX);
        const startDays = Math.floor(left / dayWidth);
        const endDays = Math.floor((left + width) / dayWidth);
        const newStart = new Date(chartStartDate);
        newStart.setDate(newStart.getDate() + startDays);
        const newEnd = new Date(chartStartDate);
        newEnd.setDate(newEnd.getDate() + endDays);
        const formatTooltipDate = (d: Date) => {
          const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
          return `${days[d.getDay()]}, ${d.toLocaleDateString('de-DE')}`;
        };
        setTooltip({ x: e.clientX + 10, y: e.clientY + 10, text: `${formatTooltipDate(newStart)} – ${formatTooltipDate(newEnd)}` });
      }
    }
  }, [dragState, createState, connectionState, dayWidth, chartStartDate, updatePhaseWithSync, movePhaseLocal, rowHeight, data.projects]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (connectionState) {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const bar = target?.closest('[data-phase]') as HTMLElement;
      
      if (bar && bar.dataset?.phase) {
        const toPhase = bar.dataset.phase;
        
        if (toPhase !== connectionState.fromPhase) {
          const conn = {
            _id: generateId('conn'),
            from: connectionState.fromSide === 'right' ? connectionState.fromPhase : toPhase,
            to: connectionState.fromSide === 'right' ? toPhase : connectionState.fromPhase
          };
          if (!data.connections.some(c => c.from === conn.from && c.to === conn.to)) {
            addConnection(conn);
          }
        }
      }
      setConnectionState(null);
      return;
    }
    
    // Send final update when drag ends
    if (dragState?.dragging) {
      const phase = data.projects.flatMap(p => p.phases).find(ph => ph._id === dragState.phaseId);
      if (phase) {
        // Check if moved to different project
        if (dragState.projectId !== dragState.originalProjectId) {
          movePhase(dragState.originalProjectId, dragState.projectId, dragState.phaseId);
        }
        // Send final position for this phase and all synced phases
        updatePhase(dragState.phaseId, { start: phase.start, end: phase.end });
        if (phase.syncWith?.length) {
          phase.syncWith.forEach(syncId => updatePhase(syncId, { start: phase.start, end: phase.end }));
        }
      }
    }
    
    if (createState) {
      const left = Math.min(createState.startX, createState.currentX);
      const width = Math.abs(createState.currentX - createState.startX);
      
      if (width >= 20) {
        const startDays = Math.floor(left / dayWidth);
        const endDays = Math.floor((left + width) / dayWidth);
        
        const newStart = new Date(chartStartDate);
        newStart.setDate(newStart.getDate() + startDays);
        const newEnd = new Date(chartStartDate);
        newEnd.setDate(newEnd.getDate() + endDays);
        
        const newPhase: Phase = {
          _id: generateId('ph'),
          name: 'Neue Phase',
          subtitle: '',
          description: '',
          link: '',
          start: formatDate(newStart),
          end: formatDate(newEnd),
          color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
          showStartLine: false,
          showEndLine: false,
          _fieldUpdates: {}
        };
        
        addPhase(createState.projectId, newPhase);
        selectPhase(createState.projectId, newPhase._id);
      }
    }
    
    setDragState(null);
    setCreateState(null);
    setTooltip(null);
  }, [createState, connectionState, dragState, data, dayWidth, chartStartDate, addPhase, addConnection, selectPhase, updatePhase, movePhase]);

  const handleConnectorMouseDown = (e: React.MouseEvent, phaseId: string, side: 'left' | 'right') => {
    if (boardRole === 'viewer') return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setConnectionState({
      fromPhase: phaseId,
      fromSide: side,
      startX: side === 'right' ? rect.right : rect.left,
      startY: rect.top + rect.height / 2,
      currentX: e.clientX,
      currentY: e.clientY
    });
  };

  const handleConnectionClick = (connId: string) => {
    if (boardRole === 'viewer') return;
    setConfirmDelete({ id: connId, type: 'connection' });
  };

  const getPhasePosition = (phaseId: string, side: 'left' | 'right') => {
    const bar = document.querySelector(`[data-phase="${phaseId}"]`) as HTMLElement;
    const body = document.querySelector('.gantt-body') as HTMLElement;
    if (!bar || !body) return null;
    
    const barRect = bar.getBoundingClientRect();
    const bodyRect = body.getBoundingClientRect();
    
    return {
      x: (side === 'right' ? barRect.right : barRect.left) - bodyRect.left,
      y: barRect.top - bodyRect.top + barRect.height / 2
    };
  };

  const handleBarMouseDown = (e: React.MouseEvent, projectId: string, phase: Phase, mode: 'move' | 'resize-left' | 'resize-right') => {
    if (boardRole === 'viewer') return;
    e.preventDefault();
    e.stopPropagation();
    
    // Shift+Click is for multi-select, don't start drag
    if (e.shiftKey) return;
    
    setDragState({
      projectId,
      originalProjectId: projectId,
      phaseId: phase._id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      originalStart: phase.start,
      originalEnd: phase.end,
      dragging: false
    });
    
    // Select phase when starting to move (not resize)
    if (mode === 'move') {
      selectPhase(projectId, phase._id);
    }
  };

  return (
    <StyledScrollContainer 
      className="gantt-scroll-container"
      $mode={theme}
      ref={scrollRef} 
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <StyledWrapper>
        {/* Labels */}
        <StyledLabels $mode={theme}>
          <StyledLabelHeader $mode={theme}>Projekte</StyledLabelHeader>
          {data.projects.map((project) => (
            <StyledLabelRow 
              key={project._id} 
              $mode={theme} 
              $selected={selectedProjectId === project._id}
              $height={rowHeight}
              onClick={() => selectProject(project._id)}
            >
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {STATUS_ICONS[project.status || '']} {project.name}
              </span>
              <StyledCategoryBadge $color={project.color}>
                {(project.category || '').substring(0, 3)}
              </StyledCategoryBadge>
            </StyledLabelRow>
          ))}
        </StyledLabels>

        {/* Chart */}
        <StyledChart>
          {/* Header */}
          <StyledHeader $mode={theme}>
            {headerMode === 'days' ? (
              // Days/Months mode - show month names with day cells
              months.map((month, i) => (
                <StyledMonth key={i} $mode={theme} $width={month.days * dayWidth}>
                  <StyledMonthName $mode={theme}>{headerPeriods[i]?.label}</StyledMonthName>
                  <StyledDayRow>
                    {Array.from({ length: month.days }, (_, d) => {
                      const day = month.startDay + d;
                      const date = new Date(chartStartDate);
                      date.setMonth(date.getMonth() + month.monthIndex);
                      date.setDate(day);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const isToday = date.getTime() === today.getTime();
                      const isMonday = date.getDay() === 1;
                      // Show day number: always on Mondays if zoom >= 10px, every day if zoom >= 35px
                      const showDay = dayWidth >= 35 || (dayWidth >= 10 && isMonday);
                      
                      return (
                        <StyledDayCell key={d} $mode={theme} $width={dayWidth} $weekend={isWeekend} $today={isToday}>
                          {showDay ? day : ''}
                        </StyledDayCell>
                      );
                    })}
                  </StyledDayRow>
                </StyledMonth>
              ))
            ) : (
              // Quarters/Years mode - simple labels
              headerPeriods.map((period, i) => (
                <StyledMonth key={i} $mode={theme} $width={period.width}>
                  <StyledMonthName $mode={theme}>
                    {period.label}{period.subLabel ? ` ${period.subLabel}` : ''}
                  </StyledMonthName>
                </StyledMonth>
              ))
            )}
          </StyledHeader>

          {/* Body */}
          <StyledBody className="gantt-body" $width={totalWidth} $height={totalHeight} onClick={handleBodyClick}>
            {showTodayLine && <StyledTodayLine $left={todayOffset * dayWidth} />}
            
            {/* Milestone lines for phases with showStartLine/showEndLine */}
            {data.projects.flatMap(p => p.phases).map(phase => {
              const lines = [];
              const phaseStart = parseDate(phase.start);
              const phaseEnd = parseDate(phase.end);
              
              if (phase.showStartLine && phaseStart >= chartStartDate && phaseStart <= chartEndDate) {
                const leftDays = Math.ceil((phaseStart.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24));
                lines.push(<StyledMilestoneLine key={`${phase._id}-start`} $left={leftDays * dayWidth} $color={phase.color} />);
              }
              if (phase.showEndLine && phaseEnd >= chartStartDate && phaseEnd <= chartEndDate) {
                const leftDays = Math.ceil((phaseEnd.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                lines.push(<StyledMilestoneLine key={`${phase._id}-end`} $left={leftDays * dayWidth} $color={phase.color} />);
              }
              return lines;
            })}
            
            {data.projects.map((project, idx) => {
              const { phaseToLane, laneCount, phaseOverlapCount } = projectLanes[idx];
              const availableHeight = rowHeight - barPadding * 2;
              const baseLaneHeight = availableHeight / Math.max(laneCount, 1);
              
              return (
              <StyledRow
                key={project._id}
                data-row
                $mode={theme}
                $top={idx * rowHeight}
                $width={totalWidth}
                $height={rowHeight}
                $color={project.color}
                onMouseDown={(e) => handleRowMouseDown(e, project._id, idx)}
              >
                {project.phases.map(phase => {
                  const phaseStart = parseDate(phase.start);
                  const phaseEnd = parseDate(phase.end);
                  
                  if (phaseEnd < chartStartDate || phaseStart > chartEndDate) return null;
                  
                  const clampedStart = phaseStart < chartStartDate ? chartStartDate : phaseStart;
                  const clampedEnd = phaseEnd > chartEndDate ? chartEndDate : phaseEnd;
                  
                  const leftDays = Math.floor((clampedStart.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24));
                  const lane = phaseToLane[phase._id] || 0;
                  const overlapCount = phaseOverlapCount[phase._id] || 1;
                  // Height based on how many phases this one overlaps with
                  const phaseBarHeight = overlapCount <= 1 ? availableHeight : (availableHeight / overlapCount) - 2;
                  const phaseTop = barPadding + lane * baseLaneHeight;
                  const durationDays = Math.ceil((clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  
                  const left = leftDays * dayWidth;
                  const width = durationDays * dayWidth;
                  const isSelected = selectedPhaseId === phase._id;
                  const remoteColor = remoteSelectionColors.get(phase._id);
                  
                  return (
                    <StyledPhaseBarWrapper key={phase._id}>
                      <StyledPhaseBar
                        data-phase={phase._id}
                        $left={left}
                        $width={width}
                        $top={phaseTop}
                        $height={phaseBarHeight}
                        $color={phase.color}
                        $selected={isSelected || selectedPhaseIds.has(phase._id)}
                        $remoteColor={remoteColor}
                        onMouseDown={(e) => handleBarMouseDown(e, project._id, phase, 'move')}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (e.shiftKey) {
                            togglePhaseSelection(phase._id);
                          } else {
                            clearSelection();
                            selectPhase(project._id, phase._id);
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setContextMenu({ x: e.clientX, y: e.clientY, phaseId: phase._id, projectId: project._id });
                        }}
                      >
                        <StyledConnector className="connector" data-connector="left" $side="left" $color={phase.color} onMouseDown={(e) => handleConnectorMouseDown(e, phase._id, 'left')} />
                        <StyledResizeHandle $side="left" onMouseDown={(e) => { e.stopPropagation(); handleBarMouseDown(e, project._id, phase, 'resize-left'); }} />
                        <StyledBarContent data-content>
                          <StyledBarTitle>{phase.name}</StyledBarTitle>
                          {phase.subtitle && <StyledBarSubtitle>{phase.subtitle}</StyledBarSubtitle>}
                        </StyledBarContent>
                        <StyledResizeHandle $side="right" onMouseDown={(e) => { e.stopPropagation(); handleBarMouseDown(e, project._id, phase, 'resize-right'); }} />
                        <StyledConnector className="connector" data-connector="right" $side="right" $color={phase.color} onMouseDown={(e) => handleConnectorMouseDown(e, phase._id, 'right')} />
                      </StyledPhaseBar>
                    </StyledPhaseBarWrapper>
                  );
                })}
              </StyledRow>
            );
            })}
            
            {/* Connections SVG */}
            {showConnections && data.connections.length > 0 && (
              <StyledConnectionSvg>
                {data.connections.map(conn => {
                  const from = getPhasePosition(conn.from, 'right');
                  const to = getPhasePosition(conn.to, 'left');
                  if (!from || !to) return null;
                  const dx = Math.abs(to.x - from.x) / 2;
                  return (
                    <StyledConnectionLine
                      key={conn._id}
                      d={`M${from.x},${from.y} C${from.x + dx},${from.y} ${to.x - dx},${to.y} ${to.x},${to.y}`}
                      onClick={() => handleConnectionClick(conn._id)}
                    />
                  );
                })}
              </StyledConnectionSvg>
            )}
            
            {/* Connection Preview */}
            {connectionState && (
              <StyledConnectionSvg style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }}>
                <StyledConnectionPreview
                  d={`M${connectionState.startX},${connectionState.startY} C${connectionState.startX + 50},${connectionState.startY} ${connectionState.currentX - 50},${connectionState.currentY} ${connectionState.currentX},${connectionState.currentY}`}
                />
              </StyledConnectionSvg>
            )}
            
            {/* Create Preview */}
            {createState && (
              <StyledCreatePreview
                $left={Math.min(createState.startX, createState.currentX)}
                $width={Math.abs(createState.currentX - createState.startX)}
                $top={createState.rowIndex * rowHeight + barPadding}
                $height={barHeight}
              />
            )}
          </StyledBody>
        </StyledChart>
      </StyledWrapper>
      
      {tooltip && (
        <StyledDragTooltip $x={tooltip.x} $y={tooltip.y} $visible={true}>
          {tooltip.text}
        </StyledDragTooltip>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Verbindung löschen"
          message="Möchtest du diese Verbindung wirklich löschen?"
          onConfirm={() => deleteConnection(confirmDelete.id)}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {contextMenu && (
        <StyledContextMenu $x={contextMenu.x} $y={contextMenu.y} $mode={theme}>
          {selectedPhaseIds.size >= 2 ? (
            <StyledContextMenuItem $mode={theme} onClick={() => { syncPhases(Array.from(selectedPhaseIds)); setContextMenu(null); }}>
              🔗 Zeitraum synchronisieren
            </StyledContextMenuItem>
          ) : (
            <>
              <StyledContextMenuItem $mode={theme} onClick={() => {
                const phase = data.projects.flatMap(p => p.phases).find(ph => ph._id === contextMenu.phaseId);
                if (phase) {
                  const newPhase = { ...phase, _id: '', name: phase.name + ' (Kopie)' };
                  addPhase(contextMenu.projectId, newPhase);
                }
                setContextMenu(null);
              }}>
                📋 Duplizieren
              </StyledContextMenuItem>
              {(() => {
                const phase = data.projects.flatMap(p => p.phases).find(ph => ph._id === contextMenu.phaseId);
                return phase?.syncWith?.length ? (
                  <StyledContextMenuItem $mode={theme} onClick={() => { unsyncPhase(contextMenu.phaseId); setContextMenu(null); }}>
                    🔓 Sync auflösen
                  </StyledContextMenuItem>
                ) : null;
              })()}
              <StyledContextMenuItem $mode={theme} $danger onClick={() => { deletePhase(contextMenu.projectId, contextMenu.phaseId); setContextMenu(null); }}>
                🗑️ Löschen
              </StyledContextMenuItem>
            </>
          )}
        </StyledContextMenu>
      )}
    </StyledScrollContainer>
  );
};
