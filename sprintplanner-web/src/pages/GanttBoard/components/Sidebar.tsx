import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { useStore } from '@/store';
import { useGanttStore } from '../store';
import { t, ThemeMode } from '@/styles';
import { Project } from '../types';
import { StatusIcon } from './ProjectModal';
import { ProjectModal } from './ProjectModal';
import { PhaseModal } from './PhaseModal';
import { ConfirmModal } from './ConfirmModal';
import { ImportBoardModal } from './ImportBoardModal';
import { DropdownMenu } from '@/components';

// === SIDEBAR LAYOUT ===
const Container = styled.div<{ $mode: ThemeMode; $collapsed?: boolean }>`
  width: ${p => p.$collapsed ? '48px' : '380px'};
  background: ${p => t(p.$mode).board};
  border-right: 1px solid ${p => t(p.$mode).stroke};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  transition: width 0.15s;
  
  @media (max-width: 768px) and (orientation: landscape) {
    display: none;
  }
`;

const Header = styled.div<{ $mode: ThemeMode; $collapsed?: boolean }>`
  padding: ${p => p.$collapsed ? t('dark').space.sm : t('dark').space.lg};
  background: ${p => t(p.$mode).panel};
  border-bottom: 1px solid ${p => t(p.$mode).strokeSubtle};
  display: flex;
  flex-direction: ${p => p.$collapsed ? 'column' : 'row'};
  justify-content: ${p => p.$collapsed ? 'center' : 'flex-start'};
  align-items: center;
  gap: ${t('dark').space.xs};
`;

const CollapseBtn = styled.button<{ $mode: ThemeMode; $collapsed?: boolean }>`
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  color: ${p => t(p.$mode).ink};
  cursor: pointer;
  padding: ${p => p.$collapsed ? t('dark').space.xs : t('dark').space.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).panel};
    border-color: ${p => t(p.$mode).action};
  }
`;

const CollapsedAddBtn = styled.button<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).action};
  border: none;
  color: white;
  cursor: pointer;
  padding: ${t('dark').space.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${t('dark').radius.sm};
  transition: all ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).actionHover};
  }
`;

const CollapsedProjectList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${t('dark').space.xs};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${t('dark').space.xs};
`;

const CollapsedProjectIcon = styled.div<{ $mode: ThemeMode; $color: string; $selected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: ${t('dark').radius.sm};
  background: ${p => p.$color};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
  border: 2px solid ${p => p.$selected ? 'white' : 'transparent'};
  box-shadow: ${p => p.$selected ? `0 0 0 2px ${t(p.$mode).action}` : 'none'};
  transition: transform ${t('dark').transition.fast};
  
  &:hover {
    transform: scale(1.1);
  }
`;

const BtnGroup = styled.div`
  display: flex;
  gap: ${t('dark').space.sm};
  align-items: center;
`;

// === CREATE BUTTON ===
const SplitBtnGroup = styled.div`
  display: flex;
  border-radius: ${t('dark').radius.md};
  overflow: hidden;
  box-shadow: ${t('dark').shadow.sm};
`;

const CreateBtn = styled.button<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  padding: ${t('dark').space.sm} ${t('dark').space.lg};
  border: none;
  background: ${p => t(p.$mode).action};
  color: white;
  font-size: ${t('dark').fontSize.base};
  font-weight: 500;
  cursor: pointer;
  transition: background ${t('dark').transition.fast};
  
  &:hover { background: ${p => t(p.$mode).actionHover}; }
`;

const SplitBtn = styled.button<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  padding: ${t('dark').space.sm} ${t('dark').space.sm};
  border: none;
  border-left: 1px solid rgba(255,255,255,0.2);
  background: ${p => t(p.$mode).action};
  color: white;
  font-size: 10px;
  cursor: pointer;
  transition: background ${t('dark').transition.fast};
  
  &:hover { background: ${p => t(p.$mode).actionHover}; }
`;

// === MENU DROPDOWN ===
const MenuWrapper = styled.div`
  position: relative;
`;

const MenuBtn = styled.button<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  color: ${p => t(p.$mode).ink};
  cursor: pointer;
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  font-size: ${t('dark').fontSize.md};
  display: flex;
  align-items: center;
  transition: all ${t('dark').transition.fast};
  
  &:hover { 
    background: ${p => t(p.$mode).panel};
    border-color: ${p => t(p.$mode).action};
  }
`;

const FilterBtn = styled.button<{ $mode: ThemeMode; $active?: boolean }>`
  background: ${p => p.$active ? t(p.$mode).action : t(p.$mode).board};
  border: 1px solid ${p => p.$active ? t(p.$mode).action : t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  color: ${p => p.$active ? 'white' : t(p.$mode).ink};
  cursor: pointer;
  padding: ${t('dark').space.sm};
  display: flex;
  align-items: center;
  transition: all ${t('dark').transition.fast};
  
  &:hover { 
    background: ${p => p.$active ? t(p.$mode).actionHover : t(p.$mode).panel};
    border-color: ${p => t(p.$mode).action};
  }
`;

// === PROJECT LIST ===
const ProjectList = styled.div<{ $mode: ThemeMode }>`
  flex: 1;
  overflow-y: auto;
  padding: ${t('dark').space.sm};
  
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: ${p => t(p.$mode).canvas};
  }
  &::-webkit-scrollbar-thumb {
    background: ${p => t(p.$mode).panel};
    border-radius: 5px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${p => t(p.$mode).action};
  }
`;

const ProjectItem = styled.div<{ $mode: ThemeMode; $selected: boolean; $dragging?: boolean }>`
  background: ${p => t(p.$mode).canvas};
  border: 1px solid ${p => p.$selected ? t(p.$mode).action : t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  margin-bottom: ${t('dark').space.sm};
  overflow: hidden;
  opacity: ${p => p.$dragging ? 0.5 : 1};
  position: relative;
  transition: border-color ${t('dark').transition.fast};
  
  &:hover { border-color: ${p => t(p.$mode).action}; }
`;

const DropIndicator = styled.div<{ $mode: ThemeMode }>`
  position: absolute;
  left: 0;
  right: 0;
  top: -6px;
  height: 3px;
  background: ${p => t(p.$mode).action};
  border-radius: 2px;
  z-index: 10;
  box-shadow: 0 0 8px ${p => t(p.$mode).action};
`;

const ProjectHeader = styled.div<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: ${p => t(p.$mode).panel};
`;

const DragHandle = styled.span<{ $mode: ThemeMode }>`
  cursor: grab;
  padding: ${t('dark').space.xs};
  color: ${p => t(p.$mode).inkFaint};
  font-size: ${t('dark').fontSize.base};
  margin-right: ${t('dark').space.sm};
  
  &:active { cursor: grabbing; }
`;

const ProjectName = styled.div<{ $mode: ThemeMode }>`
  font-weight: 600;
  font-size: ${t('dark').fontSize.sm};
  color: ${p => t(p.$mode).ink};
`;

const ProjectCategory = styled.div<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.xs};
  margin-top: ${t('dark').space.xs};
  display: flex;
  align-items: center;
  gap: ${t('dark').space.xs};
  color: ${p => t(p.$mode).inkMuted};
`;

const ColorDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => p.$color};
`;

const Actions = styled.div`
  display: flex;
  gap: ${t('dark').space.xs};
`;

const IconBtn = styled.button<{ $mode: ThemeMode }>`
  background: transparent;
  border: none;
  color: ${p => t(p.$mode).inkFaint};
  cursor: pointer;
  padding: ${t('dark').space.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color ${t('dark').transition.fast};
  
  &:hover { color: ${p => t(p.$mode).action}; }
`;

// === PHASE LIST ===
const PhaseList = styled.div<{ $expanded: boolean }>`
  padding: ${p => p.$expanded ? t('dark').space.sm : '0'} ${p => p.$expanded ? t('dark').space.md : '0'};
  max-height: ${p => p.$expanded ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.15s ease-out, padding 0.15s ease-out;
`;

const PhaseItem = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  padding: ${t('dark').space.sm};
  background: ${p => t(p.$mode).panel};
  border-radius: ${t('dark').radius.sm};
  margin-bottom: ${t('dark').space.xs};
  cursor: pointer;
  font-size: ${t('dark').fontSize.xs};
  transition: opacity ${t('dark').transition.fast};
  
  &:hover { opacity: 0.8; }
`;

const PhaseColor = styled.div<{ $color: string }>`
  width: 14px;
  height: 14px;
  border-radius: ${t('dark').radius.sm};
  background: ${p => p.$color};
  flex-shrink: 0;
`;

const PhaseInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PhaseName = styled.div<{ $mode: ThemeMode }>`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${p => t(p.$mode).ink};
`;

const PhaseDates = styled.div<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkFaint};
`;

const AccordionToggle = styled.span<{ $expanded: boolean }>`
  font-size: ${t('dark').fontSize.xs};
  display: inline-block;
  transform: ${p => p.$expanded ? 'rotate(90deg)' : 'none'};
  transition: transform 0.15s;
  margin-right: ${t('dark').space.xs};
`;

const PhaseCount = styled.span<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkFaint};
  font-weight: normal;
`;

const StatusNoteModal = styled.div<{ $mode: ThemeMode }>`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const StatusNoteContent = styled.div<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).canvas};
  border-radius: ${t('dark').radius.lg};
  padding: ${t('dark').space.lg};
  width: 90%;
  max-width: 700px;
  height: 70vh;
  display: flex;
  flex-direction: column;
`;

const StatusNoteHeader = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  margin-bottom: ${t('dark').space.md};
  font-weight: 600;
  
  span:first-of-type { flex: 1; }
`;

const CloseBtn = styled.button<{ $mode: ThemeMode }>`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${p => t(p.$mode).ink};
  opacity: 0.6;
  &:hover { opacity: 1; }
`;

const StatusNoteText = styled.div<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkMuted};
  white-space: pre-wrap;
`;

const StatusNoteTextarea = styled.textarea<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  padding: ${t('dark').space.md};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.sm};
  flex: 1;
  resize: none;
  &:focus { outline: none; border-color: ${p => t(p.$mode).action}; }
`;

const StatusNoteFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${t('dark').space.md};
`;

const FooterBtn = styled.button<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).action};
  color: white;
  border: none;
  padding: ${t('dark').space.sm} ${t('dark').space.lg};
  border-radius: ${t('dark').radius.md};
  cursor: pointer;
  &:hover { background: ${p => t(p.$mode).actionHover}; }
`;

export const Sidebar = () => {
  const { theme } = useStore();
  const { 
    data, selectedProjectId, expandedProjects, boardRole, sidebarCollapsed, toggleSidebar,
    selectPhase, toggleProjectExpanded, addProject, updateProject, deleteProject, reorderProjects, importData, addPhase,
    statusNoteProject, setStatusNoteProject, hideCompleted, toggleHideCompleted,
    hideLocked, toggleHideLocked, statusFilter, setStatusFilter
  } = useGanttStore();
  const dragItem = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projectModal, setProjectModal] = useState<{ project?: Project } | null>(null);
  const [phaseModal, setPhaseModal] = useState<{ projectId: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ projectId: string; projectName: string } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [importBoardModal, setImportBoardModal] = useState(false);
  const [splitMenuOpen, setSplitMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [mainMenuOpen, setMainMenuOpen] = useState(false);

  const handleSaveProject = (project: Project) => {
    if (projectModal?.project) {
      updateProject(project._id, project);
    } else {
      addProject(project);
    }
    setProjectModal(null);
  };

  const handleSavePhase = (projectId: string, phase: any) => {
    addPhase(projectId, phase);
    selectPhase(projectId, phase._id);
    setPhaseModal(null);
  };

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `board-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (imported.projects) {
          importData(imported);
          alert(`${imported.projects.length} Projekt(e) importiert.`);
        }
      } catch (err) {
        alert('Import fehlgeschlagen');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    setDraggedIndex(index);
    const target = e.currentTarget as HTMLElement;
    const clone = target.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.width = target.offsetWidth + 'px';
    document.body.appendChild(clone);
    e.dataTransfer.setDragImage(clone, 0, 0);
    setTimeout(() => document.body.removeChild(clone), 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDropTargetIndex(index);
    if (dragItem.current !== null && dragItem.current !== index) {
      reorderProjects(dragItem.current, index);
      dragItem.current = index;
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const sortedProjects = data.projects
    .filter(p => {
      if (hideCompleted && p.status === 'complete') return false;
      if (hideLocked && p.locked) return false;
      if (statusFilter === 'active' && (!p.status || p.status === 'complete')) return false;
      if (statusFilter === 'problems' && p.status !== 'warning' && p.status !== 'delay') return false;
      return true;
    })
    .map(p => ({
      ...p,
      phases: [...p.phases].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    }));

  return (
    <Container $mode={theme} $collapsed={sidebarCollapsed}>
      <Header $mode={theme} $collapsed={sidebarCollapsed}>
        {sidebarCollapsed ? (
          <>
            {boardRole !== 'viewer' && (
              <CollapsedAddBtn $mode={theme} onClick={() => setProjectModal({})} title="Neues Projekt">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </CollapsedAddBtn>
            )}
            <CollapseBtn $mode={theme} $collapsed onClick={toggleSidebar} title="Sidebar einblenden">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </CollapseBtn>
          </>
        ) : (
          <BtnGroup>
            {boardRole !== 'viewer' && (
              <div style={{ position: 'relative' }}>
                <SplitBtnGroup>
                  <CreateBtn $mode={theme} onClick={() => setProjectModal({})}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Projekt
                  </CreateBtn>
                  <SplitBtn $mode={theme} onClick={() => setSplitMenuOpen(!splitMenuOpen)}>
                  ▼
                </SplitBtn>
              </SplitBtnGroup>
              {splitMenuOpen && (
                <DropdownMenu
                  items={[{ label: 'Von anderem Board importieren', onClick: () => setImportBoardModal(true) }]}
                  onClose={() => setSplitMenuOpen(false)}
                  align="left"
                />
              )}
            </div>
          )}
          {boardRole !== 'viewer' && (
            <MenuWrapper>
              <MenuBtn $mode={theme} onClick={() => setMainMenuOpen(!mainMenuOpen)}>⋮</MenuBtn>
              {mainMenuOpen && (
                <DropdownMenu
                  items={[
                    { label: 'Export JSON', onClick: handleExport },
                    { label: 'Import JSON', onClick: () => fileInputRef.current?.click() },
                  ]}
                  onClose={() => setMainMenuOpen(false)}
                />
              )}
            </MenuWrapper>
          )}
          <MenuWrapper>
            <FilterBtn $mode={theme} $active={hideCompleted || hideLocked || statusFilter !== 'all'} onClick={() => setFilterMenuOpen(!filterMenuOpen)} title="Filter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </FilterBtn>
            {filterMenuOpen && (
              <DropdownMenu
                minWidth={220}
                items={[
                  { type: 'divider', label: 'Ausblenden' },
                  { label: 'Abgeschlossene', icon: hideCompleted 
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#6366f1" stroke="#6366f1" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4" fill="none" stroke="white"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>, onClick: toggleHideCompleted },
                  { label: 'Gesperrte', icon: hideLocked
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#6366f1" stroke="#6366f1" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4" fill="none" stroke="white"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>, onClick: toggleHideLocked },
                  { type: 'divider', label: 'Status-Filter' },
                  { label: 'Alle anzeigen', icon: statusFilter === 'all'
                    ? <svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#6366f1"/><circle cx="12" cy="12" r="4" fill="white"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>, onClick: () => setStatusFilter('all') },
                  { label: 'Nur aktive', icon: statusFilter === 'active'
                    ? <svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#6366f1"/><circle cx="12" cy="12" r="4" fill="white"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>, onClick: () => setStatusFilter('active') },
                  { label: 'Nur Probleme', icon: statusFilter === 'problems'
                    ? <svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#6366f1"/><circle cx="12" cy="12" r="4" fill="white"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>, onClick: () => setStatusFilter('problems') },
                ]}
                onClose={() => setFilterMenuOpen(false)}
              />
            )}
          </MenuWrapper>
          <CollapseBtn $mode={theme} onClick={toggleSidebar} title="Sidebar ausblenden">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </CollapseBtn>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </BtnGroup>
        )}
      </Header>
      {!sidebarCollapsed && (
      <ProjectList $mode={theme}>
        {sortedProjects.map((project, index) => {
          const isExpanded = expandedProjects.has(project._id);
          const isSelected = selectedProjectId === project._id;
          const isDragging = draggedIndex === index;
          const showDropIndicator = dropTargetIndex === index && draggedIndex !== null && draggedIndex !== index;
          
          return (
            <ProjectItem
              key={project._id}
              $mode={theme}
              $selected={isSelected}
              $dragging={isDragging}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {showDropIndicator && <DropIndicator $mode={theme} />}
              <ProjectHeader $mode={theme} onClick={() => toggleProjectExpanded(project._id)}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <DragHandle $mode={theme} onMouseDown={e => e.stopPropagation()}>⋮⋮</DragHandle>
                  <div>
                    <ProjectName $mode={theme}>
                      <AccordionToggle $expanded={isExpanded}>▶</AccordionToggle>
                      {project.status && <span onClick={e => { e.stopPropagation(); setStatusNoteProject(project); }} style={{ display: 'inline-flex', verticalAlign: 'middle', cursor: 'pointer' }} title={project.statusNote || 'Klicken für Details'}><StatusIcon status={project.status} size={14} /></span>} {project.name}
                      <PhaseCount $mode={theme}> ({project.phases.length})</PhaseCount>
                    </ProjectName>
                    <ProjectCategory $mode={theme}>
                      <ColorDot $color={project.color} />
                      {project.category || 'Keine Kategorie'}
                    </ProjectCategory>
                  </div>
                </div>
                {boardRole !== 'viewer' && (
                  <Actions>
                    <IconBtn $mode={theme} onClick={e => { e.stopPropagation(); setPhaseModal({ projectId: project._id }); }} title="Phase hinzufügen">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </IconBtn>
                    <IconBtn $mode={theme} onClick={e => { e.stopPropagation(); setProjectModal({ project }); }} title="Bearbeiten">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </IconBtn>
                    <IconBtn $mode={theme} onClick={e => { e.stopPropagation(); setDeleteConfirm({ projectId: project._id, projectName: project.name }); }} title="Löschen">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </IconBtn>
                  </Actions>
                )}
              </ProjectHeader>
              <PhaseList $expanded={isExpanded}>
                {project.phases.map(phase => (
                  <PhaseItem key={phase._id} $mode={theme} onClick={() => selectPhase(project._id, phase._id)}>
                    <PhaseColor $color={phase.color} />
                    <PhaseInfo>
                      <PhaseName $mode={theme}>{phase.name}</PhaseName>
                      <PhaseDates $mode={theme}>{phase.start} → {phase.end}</PhaseDates>
                    </PhaseInfo>
                  </PhaseItem>
                ))}
              </PhaseList>
            </ProjectItem>
          );
        })}
      </ProjectList>
      )}
      {sidebarCollapsed && (
        <CollapsedProjectList>
          {sortedProjects.map((project, index) => (
            <CollapsedProjectIcon
              key={project._id}
              $mode={theme}
              $color={project.color}
              $selected={selectedProjectId === project._id}
              onClick={() => toggleProjectExpanded(project._id)}
              title={project.name}
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={e => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {project.name.charAt(0).toUpperCase()}
            </CollapsedProjectIcon>
          ))}
        </CollapsedProjectList>
      )}
      
      {projectModal && (
        <ProjectModal
          project={projectModal.project}
          onSave={handleSaveProject}
          onClose={() => setProjectModal(null)}
        />
      )}
      
      {phaseModal && (
        <PhaseModal
          projectId={phaseModal.projectId}
          onSave={handleSavePhase}
          onClose={() => setPhaseModal(null)}
        />
      )}
      
      {deleteConfirm && (
        <ConfirmModal
          title="Projekt löschen"
          message={`Möchtest du das Projekt "${deleteConfirm.projectName}" wirklich löschen?`}
          onConfirm={() => deleteProject(deleteConfirm.projectId)}
          onClose={() => setDeleteConfirm(null)}
        />
      )}

      {importBoardModal && (
        <ImportBoardModal
          onImport={(projects) => projects.forEach(p => {
            const newProjectId = `p_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            addProject({
              ...p,
              _id: newProjectId,
              color: p.color || '#6366f1',
              phases: p.phases.map(ph => ({
                ...ph,
                _id: `ph_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
              }))
            });
          })}
          onClose={() => setImportBoardModal(false)}
        />
      )}

      {statusNoteProject && (
        <StatusNoteModal $mode={theme} onClick={() => setStatusNoteProject(null)}>
          <StatusNoteContent $mode={theme} onClick={e => e.stopPropagation()}>
            <StatusNoteHeader $mode={theme}>
              <StatusIcon status={statusNoteProject.status || 'ok'} size={20} />
              <span>{statusNoteProject.name}</span>
              <CloseBtn $mode={theme} onClick={() => setStatusNoteProject(null)}>×</CloseBtn>
            </StatusNoteHeader>
            {boardRole === 'viewer' ? (
              <StatusNoteText $mode={theme}>{statusNoteProject.statusNote || 'Keine Statusnotiz vorhanden.'}</StatusNoteText>
            ) : (
              <StatusNoteTextarea
                $mode={theme}
                value={statusNoteProject.statusNote || ''}
                onChange={e => setStatusNoteProject({ ...statusNoteProject, statusNote: e.target.value })}
                onBlur={() => updateProject(statusNoteProject._id, { statusNote: statusNoteProject.statusNote })}
                placeholder="Statusnotiz eingeben..."
              />
            )}
            <StatusNoteFooter>
              <FooterBtn $mode={theme} onClick={() => { updateProject(statusNoteProject._id, { statusNote: statusNoteProject.statusNote }); setStatusNoteProject(null); }}>Schließen</FooterBtn>
            </StatusNoteFooter>
          </StatusNoteContent>
        </StatusNoteModal>
      )}
    </Container>
  );
};
