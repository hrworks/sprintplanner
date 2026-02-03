import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { Button } from '@/components';
import { useStore } from '@/store';
import { useGanttStore } from '../store';
import { getColors } from '@/styles';
import { Project, STATUS_ICONS } from '../types';
import { ProjectModal } from './ProjectModal';
import { PhaseModal } from './PhaseModal';

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
  flex-wrap: wrap;
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
    selectPhase, toggleProjectExpanded, addProject, updateProject, deleteProject, reorderProjects, setData, addPhase
  } = useGanttStore();
  const dragItem = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projectModal, setProjectModal] = useState<{ project?: Project } | null>(null);
  const [phaseModal, setPhaseModal] = useState<{ projectId: string } | null>(null);

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
          setData(imported);
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
            <Button $size="small" onClick={() => setProjectModal({})}>+ Projekt</Button>
          )}
        </StyledBtnGroup>
        <StyledBtnGroup style={{ marginTop: 8 }}>
          <Button $variant="secondary" $size="small" onClick={handleExport}>Export</Button>
          <Button $variant="secondary" $size="small" onClick={() => fileInputRef.current?.click()}>Import</Button>
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
                    <StyledIconBtn $mode={theme} onClick={e => { e.stopPropagation(); deleteProject(project._id); }}>🗑</StyledIconBtn>
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
    </StyledSidebar>
  );
};
