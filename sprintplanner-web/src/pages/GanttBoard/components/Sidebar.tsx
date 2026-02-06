import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { useStore } from '@/store';
import { useGanttStore } from '../store';
import { t, ThemeMode } from '@/styles';
import { Project, STATUS_ICONS } from '../types';
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
  font-size: ${t('dark').fontSize.base};
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

export const Sidebar = () => {
  const { theme } = useStore();
  const { 
    data, selectedProjectId, expandedProjects, boardRole, sidebarCollapsed, toggleSidebar,
    selectPhase, toggleProjectExpanded, addProject, updateProject, deleteProject, reorderProjects, importData, addPhase
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

  const sortedProjects = data.projects.map(p => ({
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
                      {STATUS_ICONS[project.status || '']} {project.name}
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
                    <IconBtn $mode={theme} onClick={e => { e.stopPropagation(); setPhaseModal({ projectId: project._id }); }}>+</IconBtn>
                    <IconBtn $mode={theme} onClick={e => { e.stopPropagation(); setProjectModal({ project }); }}>✎</IconBtn>
                    <IconBtn $mode={theme} onClick={e => { e.stopPropagation(); setDeleteConfirm({ projectId: project._id, projectName: project.name }); }}>🗑</IconBtn>
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
    </Container>
  );
};
