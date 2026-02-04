import styled from '@emotion/styled';
import { Button } from '@/components';
import { useStore } from '@/store';
import { useGanttStore } from '../store';
import { getColors } from '@/styles';
import { DEFAULT_COLORS } from '../types';

const StyledPanel = styled.div<{ $mode: string; $visible: boolean }>`
  width: 320px;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgSecondary};
  border-left: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').border};
  display: ${p => p.$visible ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
`;

const StyledHeader = styled.div<{ $mode: string }>`
  padding: 15px;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary};
  border-bottom: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').bgPrimary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 { color: ${p => getColors(p.$mode as 'dark' | 'light').accent}; font-size: 13px; margin: 0; }
`;

const StyledContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
`;

const StyledFormGroup = styled.div`
  margin-bottom: 12px;
`;

const StyledLabel = styled.label<{ $mode: string }>`
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textSecondary};
`;

const StyledInput = styled.input<{ $mode: string }>`
  width: 100%;
  padding: 8px;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgPrimary};
  border: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').border};
  border-radius: 4px;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textPrimary};
  font-size: 12px;
  &:focus { outline: none; border-color: ${p => getColors(p.$mode as 'dark' | 'light').accent}; }
`;

const StyledTextarea = styled.textarea<{ $mode: string }>`
  width: 100%;
  padding: 8px;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgPrimary};
  border: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').border};
  border-radius: 4px;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textPrimary};
  font-size: 12px;
  resize: vertical;
  min-height: 60px;
  &:focus { outline: none; border-color: ${p => getColors(p.$mode as 'dark' | 'light').accent}; }
`;

const StyledColorPicker = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const StyledColorOption = styled.div<{ $color: string; $selected: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 4px;
  cursor: pointer;
  background: ${p => p.$color};
  border: 2px solid ${p => p.$selected ? '#fff' : 'transparent'};
  transform: ${p => p.$selected ? 'scale(1.15)' : 'none'};
  transition: all 0.2s;
  &:hover { transform: scale(1.15); }
`;

const StyledCheckboxGroup = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const StyledCheckboxLabel = styled.label<{ $mode: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textPrimary};
  input { accent-color: #e94560; width: 16px; height: 16px; }
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

const StyledEmpty = styled.p<{ $mode: string }>`
  color: ${p => getColors(p.$mode as 'dark' | 'light').textSecondary};
  text-align: center;
  margin-top: 50px;
`;

export const DetailPanel = () => {
  const { theme } = useStore();
  const { 
    data, selectedProjectId, selectedPhaseId, showDetailPanel, boardRole,
    toggleDetailPanel, updatePhase, deletePhase
  } = useGanttStore();

  const project = data.projects.find(p => p._id === selectedProjectId);
  const phase = project?.phases.find(ph => ph._id === selectedPhaseId);

  const handleChange = (field: string, value: string | boolean) => {
    if (phase) updatePhase(phase._id, { [field]: value });
  };

  const handleDelete = () => {
    if (project && phase && confirm(`Phase "${phase.name}" wirklich löschen?`)) {
      deletePhase(project._id, phase._id);
    }
  };

  return (
    <StyledPanel $mode={theme} $visible={showDetailPanel && !!phase}>
      <StyledHeader $mode={theme}>
        <h3>Phase bearbeiten</h3>
        <StyledIconBtn $mode={theme} onClick={toggleDetailPanel}>✕</StyledIconBtn>
      </StyledHeader>
      <StyledContent>
        {!phase ? (
          <StyledEmpty $mode={theme}>Wählen Sie eine Phase aus</StyledEmpty>
        ) : (
          <>
            <StyledFormGroup>
              <StyledLabel $mode={theme}>Name</StyledLabel>
              <StyledInput $mode={theme} value={phase.name} onChange={e => handleChange('name', e.target.value)} disabled={boardRole === 'viewer'} />
            </StyledFormGroup>
            <StyledFormGroup>
              <StyledLabel $mode={theme}>Untertitel</StyledLabel>
              <StyledInput $mode={theme} value={phase.subtitle || ''} placeholder="z.B. Max, Anna" onChange={e => handleChange('subtitle', e.target.value)} disabled={boardRole === 'viewer'} />
            </StyledFormGroup>
            <StyledFormGroup>
              <StyledLabel $mode={theme}>Startdatum</StyledLabel>
              <StyledInput $mode={theme} type="date" value={phase.start} onChange={e => handleChange('start', e.target.value)} disabled={boardRole === 'viewer'} />
            </StyledFormGroup>
            <StyledFormGroup>
              <StyledLabel $mode={theme}>Enddatum</StyledLabel>
              <StyledInput $mode={theme} type="date" value={phase.end} onChange={e => handleChange('end', e.target.value)} disabled={boardRole === 'viewer'} />
            </StyledFormGroup>
            <StyledFormGroup>
              <StyledLabel $mode={theme}>Link</StyledLabel>
              <StyledInput $mode={theme} type="url" value={phase.link || ''} placeholder="https://..." onChange={e => handleChange('link', e.target.value)} disabled={boardRole === 'viewer'} />
            </StyledFormGroup>
            <StyledFormGroup>
              <StyledLabel $mode={theme}>Beschreibung</StyledLabel>
              <StyledTextarea $mode={theme} value={phase.description || ''} placeholder="Details zur Phase..." onChange={e => handleChange('description', e.target.value)} disabled={boardRole === 'viewer'} />
            </StyledFormGroup>
            <StyledFormGroup>
              <StyledLabel $mode={theme}>Milestone-Linien</StyledLabel>
              <StyledCheckboxGroup>
                <StyledCheckboxLabel $mode={theme}>
                  <input type="checkbox" checked={phase.showStartLine || false} onChange={e => handleChange('showStartLine', e.target.checked)} disabled={boardRole === 'viewer'} />
                  <span style={{ color: '#4ade80' }}>▏</span> Startlinie
                </StyledCheckboxLabel>
                <StyledCheckboxLabel $mode={theme}>
                  <input type="checkbox" checked={phase.showEndLine || false} onChange={e => handleChange('showEndLine', e.target.checked)} disabled={boardRole === 'viewer'} />
                  <span style={{ color: '#f97316' }}>▏</span> Endlinie
                </StyledCheckboxLabel>
              </StyledCheckboxGroup>
            </StyledFormGroup>
            <StyledFormGroup>
              <StyledLabel $mode={theme}>Farbe</StyledLabel>
              <StyledColorPicker>
                {DEFAULT_COLORS.map(color => (
                  <StyledColorOption key={color} $color={color} $selected={phase.color === color} onClick={() => boardRole !== 'viewer' && handleChange('color', color)} />
                ))}
              </StyledColorPicker>
            </StyledFormGroup>
            {boardRole !== 'viewer' && (
              <StyledFormGroup style={{ marginTop: 20 }}>
                <Button $variant="danger" style={{ width: '100%' }} onClick={handleDelete}>🗑 Phase löschen</Button>
              </StyledFormGroup>
            )}
          </>
        )}
      </StyledContent>
    </StyledPanel>
  );
};
