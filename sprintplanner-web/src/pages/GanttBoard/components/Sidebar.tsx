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

// === SIDEBAR LAYOUT ===
const Container = styled.div<{ $mode: ThemeMode }>`
  width: 380px;
  background: ${p => t(p.$mode).board};
  border-right: 1px solid ${p => t(p.$mode).stroke};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
`;

const Header = styled.div<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.lg};
  background: ${p => t(p.$mode).panel};
  border-bottom: 1px solid ${p => t(p.$mode).strokeSubtle};
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

const SplitBtn = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  padding: ${t('dark').space.sm} ${t('dark').space.sm};
  border: none;
  border-left: 1px solid rgba(255,255,255,0.2);
  background: ${p => t(p.$mode).action};
  color: white;
  font-size: 10px;
  cursor: pointer;
  position: relative;
  transition: background ${t('dark').transition.fast};
  
  &:hover { background: ${p => t(p.$mode).actionHover}; }
  &:hover > div { display: block; }
`;

const DropdownContent = styled.div<{ $mode: ThemeMode }>`
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  padding-top: ${t('dark').space.xs};
  z-index: 1000;
  min-width: 220px;
  
  & > div {
    background: ${p => t(p.$mode).board};
    border: 1px solid ${p => t(p.$mode).stroke};
    border-radius: ${t('dark').radius.md};
    box-shadow: ${t('dark').shadow.lg};
  }
`;

// === MENU DROPDOWN ===
const MenuDropdown = styled.div`
  position: relative;
  &:hover > div:last-child { display: block; }
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

const MenuDropdownContent = styled.div<{ $mode: ThemeMode }>`
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  box-shadow: ${t('dark').shadow.lg};
  z-index: 1000;
  min-width: 140px;
  overflow: hidden;
`;

const MenuItem = styled.div<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  cursor: pointer;
  font-size: ${t('dark').fontSize.sm};
  color: ${p => t(p.$mode).ink};
  transition: background ${t('dark').transition.fast};
  
  &:hover { background: ${p => t(p.$mode).actionMuted}; }
`;

// === PROJECT LIST ===
const ProjectList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${t('dark').space.sm};
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
  transition: max-height 0.3s ease-out, padding 0.3s ease-out;
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
  transition: transform 0.3s;
  margin-right: ${t('dark').space.xs};
`;

const PhaseCount = styled.span<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkFaint};
  font-weight: normal;
`;

export const Sidebar = () => {
  const { theme } = useStore();
  const { 
    data, selectedProjectId, expandedProjects, boardRole,
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
    <Container $mode={theme}>
      <Header $mode={theme}>
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
                <SplitBtn $mode={theme}>
                  ▼
                  <DropdownContent $mode={theme}>
                    <div>
                      <MenuItem $mode={theme} onClick={() => setImportBoardModal(true)}>Von anderem Board importieren</MenuItem>
                    </div>
                  </DropdownContent>
                </SplitBtn>
              </SplitBtnGroup>
            </div>
          )}
          <MenuDropdown>
            <MenuBtn $mode={theme}>⋮</MenuBtn>
            <MenuDropdownContent $mode={theme}>
              <MenuItem $mode={theme} onClick={handleExport}>Export JSON</MenuItem>
              <MenuItem $mode={theme} onClick={() => fileInputRef.current?.click()}>Import JSON</MenuItem>
            </MenuDropdownContent>
          </MenuDropdown>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </BtnGroup>
      </Header>
      <ProjectList>
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
