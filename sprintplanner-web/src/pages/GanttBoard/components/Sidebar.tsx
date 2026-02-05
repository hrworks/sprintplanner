import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { useStore } from '@/store';
import { useGanttStore } from '../store';
import { getColors } from '@/styles';
import { Project, STATUS_ICONS } from '../types';
import { ProjectModal } from './ProjectModal';
import { PhaseModal } from './PhaseModal';
import { ConfirmModal } from './ConfirmModal';
import { ImportBoardModal } from './ImportBoardModal';

const StyledSidebar = styled.div<{ $mode: string }>`
  width: 380px;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgSecondary};
  border-right: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
`;

const StyledHeader = styled.div<{ $mode: string }>`
  padding: 20px;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary};
  border-bottom: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').bgPrimary};
`;

const StyledBtnGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StyledCreateBtn = styled.button<{ $mode: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px 0 0 8px;
  border: none;
  background: #e94560;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: box-shadow 0.2s, background 0.2s;
  &:hover { 
    background: #d63850;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
`;

const StyledSplitBtn = styled.div<{ $mode: string }>`
  display: flex;
  align-items: center;
  padding: 12px 10px;
  border-radius: 0 8px 8px 0;
  border: none;
  border-left: 1px solid rgba(255,255,255,0.2);
  background: #e94560;
  color: white;
  font-size: 10px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  &:hover { background: #d63850; }
  &:hover > div { display: block; }
`;

const StyledSplitBtnGroup = styled.div`
  display: flex;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  border-radius: 8px;
`;

const StyledProjectDropdown = styled.div<{ $mode: string }>`
  position: relative;
`;

const StyledProjectDropdownContent = styled.div<{ $mode: string }>`
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  padding-top: 4px;
  background: transparent;
  z-index: 1000;
  min-width: 220px;
  & > div {
    background: ${p => getColors(p.$mode as 'dark' | 'light').bgSecondary};
    border: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').border};
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
`;

const StyledDropdownArrow = styled.span`
  font-size: 10px;
  opacity: 0.9;
`;

const StyledMenuDropdown = styled.div<{ $mode: string }>`
  position: relative;
  &:hover > div:last-child { display: block; }
`;

const StyledMenuBtn = styled.button<{ $mode: string }>`
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgSecondary};
  border: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').border};
  border-radius: 6px;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textPrimary};
  cursor: pointer;
  padding: 12px 14px;
  font-size: 16px;
  display: flex;
  align-items: center;
  &:hover { background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary}; }
`;

const StyledMenuDropdownContent = styled.div<{ $mode: string }>`
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgSecondary};
  border: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').border};
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 1000;
  min-width: 140px;
`;

const StyledMenuItem = styled.div<{ $mode: string }>`
  padding: 10px 16px;
  cursor: pointer;
  font-size: 13px;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textPrimary};
  &:hover { background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary}; }
`;

const StyledProjectList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const StyledProjectItem = styled.div<{ $mode: string; $selected: boolean; $dragging?: boolean }>`
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgPrimary};
  border: 1px solid ${p => p.$selected ? getColors(p.$mode as 'dark' | 'light').accent : getColors(p.$mode as 'dark' | 'light').border};
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
  opacity: ${p => p.$dragging ? 0.5 : 1};
  &:hover { border-color: ${p => getColors(p.$mode as 'dark' | 'light').accent}; }
`;

const StyledProjectHeader = styled.div<{ $mode: string }>`
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary};
`;

const StyledDragHandle = styled.span<{ $mode: string }>`
  cursor: grab;
  padding: 5px;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textSecondary};
  font-size: 14px;
  margin-right: 8px;
  &:active { cursor: grabbing; }
`;

const StyledProjectName = styled.div`
  font-weight: 600;
  font-size: 13px;
`;

const StyledProjectCategory = styled.div<{ $mode: string }>`
  font-size: 10px;
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textSecondary};
`;

const StyledColorDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => p.$color};
`;

const StyledActions = styled.div`
  display: flex;
  gap: 5px;
`;

const StyledIconBtn = styled.button<{ $mode: string }>`
  background: transparent;
  border: none;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textSecondary};
  cursor: pointer;
  padding: 5px;
  font-size: 14px;
  &:hover { color: ${p => getColors(p.$mode as 'dark' | 'light').accent}; }
`;

const StyledPhaseList = styled.div<{ $expanded: boolean }>`
  padding: ${p => p.$expanded ? '10px 15px' : '0'};
  max-height: ${p => p.$expanded ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease-out;
`;

const StyledPhaseItem = styled.div<{ $mode: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary};
  border-radius: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  font-size: 12px;
  &:hover { opacity: 0.8; }
`;

const StyledPhaseColor = styled.div<{ $color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: ${p => p.$color};
  flex-shrink: 0;
`;

const StyledPhaseInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledPhaseName = styled.div`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledPhaseDates = styled.div<{ $mode: string }>`
  font-size: 10px;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textSecondary};
`;

const StyledAccordionToggle = styled.span<{ $expanded: boolean }>`
  font-size: 12px;
  display: inline-block;
  transform: ${p => p.$expanded ? 'rotate(90deg)' : 'none'};
  transition: transform 0.3s;
  margin-right: 4px;
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

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragItem.current !== null && dragItem.current !== index) {
      reorderProjects(dragItem.current, index);
      dragItem.current = index;
    }
  };

  const handleDragEnd = () => {
    dragItem.current = null;
  };

  const sortedProjects = data.projects.map(p => ({
    ...p,
    phases: [...p.phases].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }));

  return (
    <StyledSidebar $mode={theme}>
      <StyledHeader $mode={theme}>
        <StyledBtnGroup>
          {boardRole !== 'viewer' && (
            <StyledProjectDropdown $mode={theme}>
              <StyledSplitBtnGroup>
                <StyledCreateBtn $mode={theme} onClick={() => setProjectModal({})}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Projekt
                </StyledCreateBtn>
                <StyledSplitBtn $mode={theme}>
                  <StyledDropdownArrow>▼</StyledDropdownArrow>
                  <StyledProjectDropdownContent $mode={theme}>
                    <div>
                      <StyledMenuItem $mode={theme} onClick={() => setImportBoardModal(true)}>Von anderem Board importieren</StyledMenuItem>
                    </div>
                  </StyledProjectDropdownContent>
                </StyledSplitBtn>
              </StyledSplitBtnGroup>
            </StyledProjectDropdown>
          )}
          <StyledMenuDropdown $mode={theme}>
            <StyledMenuBtn $mode={theme}>⋮</StyledMenuBtn>
            <StyledMenuDropdownContent $mode={theme}>
              <StyledMenuItem $mode={theme} onClick={handleExport}>Export JSON</StyledMenuItem>
              <StyledMenuItem $mode={theme} onClick={() => fileInputRef.current?.click()}>Import JSON</StyledMenuItem>
            </StyledMenuDropdownContent>
          </StyledMenuDropdown>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </StyledBtnGroup>
      </StyledHeader>
      <StyledProjectList>
        {sortedProjects.map((project, index) => {
          const isExpanded = expandedProjects.has(project._id);
          const isSelected = selectedProjectId === project._id;
          
          return (
            <StyledProjectItem
              key={project._id}
              $mode={theme}
              $selected={isSelected}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <StyledProjectHeader $mode={theme} onClick={() => toggleProjectExpanded(project._id)}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StyledDragHandle $mode={theme} onMouseDown={e => e.stopPropagation()}>⋮⋮</StyledDragHandle>
                  <div>
                    <StyledProjectName>
                      <StyledAccordionToggle $expanded={isExpanded}>▶</StyledAccordionToggle>
                      {STATUS_ICONS[project.status || '']} {project.name}
                      <span style={{ color: '#888', fontWeight: 'normal' }}> ({project.phases.length})</span>
                    </StyledProjectName>
                    <StyledProjectCategory $mode={theme}>
                      <StyledColorDot $color={project.color} />
                      {project.category || 'Keine Kategorie'}
                    </StyledProjectCategory>
                  </div>
                </div>
                {boardRole !== 'viewer' && (
                  <StyledActions>
                    <StyledIconBtn $mode={theme} onClick={e => { e.stopPropagation(); setPhaseModal({ projectId: project._id }); }}>+</StyledIconBtn>
                    <StyledIconBtn $mode={theme} onClick={e => { e.stopPropagation(); setProjectModal({ project }); }}>✎</StyledIconBtn>
                    <StyledIconBtn $mode={theme} onClick={e => { e.stopPropagation(); setDeleteConfirm({ projectId: project._id, projectName: project.name }); }}>🗑</StyledIconBtn>
                  </StyledActions>
                )}
              </StyledProjectHeader>
              <StyledPhaseList $expanded={isExpanded}>
                {project.phases.map(phase => (
                  <StyledPhaseItem key={phase._id} $mode={theme} onClick={() => selectPhase(project._id, phase._id)}>
                    <StyledPhaseColor $color={phase.color} />
                    <StyledPhaseInfo>
                      <StyledPhaseName>{phase.name}</StyledPhaseName>
                      <StyledPhaseDates $mode={theme}>{phase.start} → {phase.end}</StyledPhaseDates>
                    </StyledPhaseInfo>
                  </StyledPhaseItem>
                ))}
              </StyledPhaseList>
            </StyledProjectItem>
          );
        })}
      </StyledProjectList>
      
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
    </StyledSidebar>
  );
};
