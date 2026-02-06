import styled from '@emotion/styled';
import { useState } from 'react';
import { Button } from '@/components';
import { useStore } from '@/store';
import { useGanttStore } from '../store';
import { t, ThemeMode } from '@/styles';
import { DEFAULT_COLORS } from '../types';

export const DetailPanel = () => {
  const { theme } = useStore();
  const [expandedField, setExpandedField] = useState<string | null>(null);
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
    <Panel $mode={theme} $visible={showDetailPanel && !!phase}>
      <Header $mode={theme}>
        <h3>Phase bearbeiten</h3>
        <CloseBtn $mode={theme} onClick={toggleDetailPanel}>✕</CloseBtn>
      </Header>
      <Content>
        {!phase ? (
          <Empty $mode={theme}>Wählen Sie eine Phase aus</Empty>
        ) : (
          <>
            <FormGroup>
              <Label $mode={theme}>Name</Label>
              <InputWrapper>
                <Input $mode={theme} value={phase.name} onChange={e => handleChange('name', e.target.value)} disabled={boardRole === 'viewer'} />
                {phase.name && boardRole !== 'viewer' && <ClearInputBtn $mode={theme} onClick={() => handleChange('name', '')}>×</ClearInputBtn>}
              </InputWrapper>
            </FormGroup>
            <FormGroup>
              <Label $mode={theme}>Untertitel</Label>
              <Input $mode={theme} value={phase.subtitle || ''} placeholder="z.B. Max, Anna" onChange={e => handleChange('subtitle', e.target.value)} disabled={boardRole === 'viewer'} />
            </FormGroup>
            <FormGroup>
              <Label $mode={theme}>Startdatum</Label>
              <Input $mode={theme} type="date" value={phase.start} onChange={e => handleChange('start', e.target.value)} disabled={boardRole === 'viewer'} />
            </FormGroup>
            <FormGroup>
              <Label $mode={theme}>Enddatum</Label>
              <Input $mode={theme} type="date" value={phase.end} onChange={e => handleChange('end', e.target.value)} disabled={boardRole === 'viewer'} />
            </FormGroup>
            <FormGroup>
              <Label $mode={theme}>Link</Label>
              <Input $mode={theme} type="url" value={phase.link || ''} placeholder="https://..." onChange={e => handleChange('link', e.target.value)} disabled={boardRole === 'viewer'} />
            </FormGroup>
            <FormGroup>
              <Label $mode={theme}>Beschreibung</Label>
              <TextareaWrapper>
                <Textarea $mode={theme} value={phase.description || ''} placeholder="Details zur Phase..." onChange={e => handleChange('description', e.target.value)} disabled={boardRole === 'viewer'} />
                <ExpandBtn $mode={theme} onClick={() => setExpandedField('description')} title="Vergrößern">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </ExpandBtn>
              </TextareaWrapper>
            </FormGroup>
            <FormGroup>
              <Label $mode={theme}>Milestone-Linien</Label>
              <CheckboxGroup>
                <CheckboxLabel $mode={theme}>
                  <input type="checkbox" checked={phase.showStartLine || false} onChange={e => handleChange('showStartLine', e.target.checked)} disabled={boardRole === 'viewer'} />
                  <span style={{ color: '#4ade80' }}>▏</span> Startlinie
                </CheckboxLabel>
                <CheckboxLabel $mode={theme}>
                  <input type="checkbox" checked={phase.showEndLine || false} onChange={e => handleChange('showEndLine', e.target.checked)} disabled={boardRole === 'viewer'} />
                  <span style={{ color: '#f97316' }}>▏</span> Endlinie
                </CheckboxLabel>
              </CheckboxGroup>
            </FormGroup>
            <FormGroup>
              <Label $mode={theme}>Farbe</Label>
              <ColorPicker>
                {DEFAULT_COLORS.map(color => (
                  <ColorOption key={color} $mode={theme} $color={color} $selected={phase.color === color} onClick={() => boardRole !== 'viewer' && handleChange('color', color)} />
                ))}
              </ColorPicker>
            </FormGroup>
            {boardRole !== 'viewer' && (
              <FormGroup style={{ marginTop: 20 }}>
                <Button $variant="danger" style={{ width: '100%' }} onClick={handleDelete}>🗑 Phase löschen</Button>
              </FormGroup>
            )}
          </>
        )}
      </Content>
      
      {expandedField === 'description' && phase && (
        <ExpandModal $mode={theme} onClick={() => setExpandedField(null)}>
          <ExpandContent $mode={theme} onClick={e => e.stopPropagation()}>
            <ExpandHeader $mode={theme}>
              <span>Beschreibung</span>
              <CloseBtn $mode={theme} onClick={() => setExpandedField(null)}>✕</CloseBtn>
            </ExpandHeader>
            <ExpandTextarea 
              $mode={theme} 
              value={phase.description || ''} 
              placeholder="Details zur Phase..." 
              onChange={e => handleChange('description', e.target.value)} 
              disabled={boardRole === 'viewer'}
              autoFocus
            />
          </ExpandContent>
        </ExpandModal>
      )}
    </Panel>
  );
};

const Panel = styled.div<{ $mode: ThemeMode; $visible: boolean }>`
  width: 320px;
  background: ${p => t(p.$mode).board};
  border-left: 1px solid ${p => t(p.$mode).stroke};
  display: ${p => p.$visible ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  
  @media (max-width: 768px) and (orientation: landscape) {
    display: none;
  }
`;

const Header = styled.div<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.md};
  background: ${p => t(p.$mode).panel};
  border-bottom: 1px solid ${p => t(p.$mode).strokeSubtle};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    color: ${p => t(p.$mode).ink};
    font-size: ${t('dark').fontSize.sm};
    font-weight: 600;
    margin: 0;
  }
`;

const CloseBtn = styled.button<{ $mode: ThemeMode }>`
  background: transparent;
  border: none;
  color: ${p => t(p.$mode).inkMuted};
  cursor: pointer;
  padding: ${t('dark').space.xs};
  font-size: ${t('dark').fontSize.base};
  transition: color ${t('dark').transition.fast};
  
  &:hover {
    color: ${p => t(p.$mode).ink};
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${t('dark').space.md};
`;

const Empty = styled.p<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkMuted};
  text-align: center;
  margin-top: 50px;
`;

const FormGroup = styled.div`
  margin-bottom: ${t('dark').space.md};
`;

const InputWrapper = styled.div`
  position: relative;
`;

const ClearInputBtn = styled.button<{ $mode: ThemeMode }>`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: ${p => t(p.$mode).inkMuted};
  padding: 4px;
  line-height: 1;
  
  &:hover { color: ${p => t(p.$mode).ink}; }
`;

const Label = styled.label<{ $mode: ThemeMode }>`
  display: block;
  margin-bottom: ${t('dark').space.xs};
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkMuted};
`;

const Input = styled.input<{ $mode: ThemeMode }>`
  width: 100%;
  padding: ${t('dark').space.sm};
  border-radius: ${t('dark').radius.md};
  border: 1px solid ${p => t(p.$mode).stroke};
  background: ${p => t(p.$mode).canvas};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.sm};
  font-family: inherit;
  color-scheme: ${p => p.$mode === 'dark' ? 'dark' : 'light'};
  transition: border-color ${t('dark').transition.fast};
  
  &::-webkit-datetime-edit { font-family: inherit; }
  
  &:focus {
    outline: none;
    border-color: ${p => t(p.$mode).action};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea<{ $mode: ThemeMode }>`
  width: 100%;
  padding: ${t('dark').space.sm};
  border-radius: ${t('dark').radius.md};
  border: 1px solid ${p => t(p.$mode).stroke};
  background: ${p => t(p.$mode).canvas};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.sm};
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  transition: border-color ${t('dark').transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${p => t(p.$mode).action};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
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

const CheckboxGroup = styled.div`
  display: flex;
  gap: ${t('dark').space.md};
  flex-wrap: wrap;
`;

const CheckboxLabel = styled.label<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  cursor: pointer;
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).ink};
  
  input {
    accent-color: #6366f1;
    width: 16px;
    height: 16px;
  }
`;

const ColorPicker = styled.div`
  display: flex;
  gap: ${t('dark').space.sm};
  flex-wrap: wrap;
`;

const ColorOption = styled.div<{ $mode: ThemeMode; $color: string; $selected: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: ${t('dark').radius.sm};
  cursor: pointer;
  background: ${p => p.$color};
  border: 2px solid ${p => p.$selected ? 'white' : 'transparent'};
  box-shadow: ${p => p.$selected ? `0 0 0 2px ${t(p.$mode).action}` : 'none'};
  transition: transform ${t('dark').transition.fast};
  
  &:hover {
    transform: scale(1.1);
  }
`;

const TextareaWrapper = styled.div`
  position: relative;
`;

const ExpandBtn = styled.button<{ $mode: ThemeMode }>`
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => t(p.$mode).panel};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.sm};
  color: ${p => t(p.$mode).inkMuted};
  cursor: pointer;
  opacity: 0.7;
  transition: all ${t('dark').transition.fast};
  
  &:hover {
    opacity: 1;
    color: ${p => t(p.$mode).ink};
    background: ${p => t(p.$mode).canvas};
  }
`;

const ExpandModal = styled.div<{ $mode: ThemeMode }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ExpandContent = styled.div<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.lg};
  padding: ${t('dark').space.lg};
  width: 700px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: ${t('dark').shadow.lg};
`;

const ExpandHeader = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${t('dark').space.md};
  color: ${p => t(p.$mode).ink};
  font-weight: 600;
`;

const ExpandTextarea = styled.textarea<{ $mode: ThemeMode }>`
  flex: 1;
  min-height: 400px;
  padding: ${t('dark').space.md};
  border-radius: ${t('dark').radius.md};
  border: 1px solid ${p => t(p.$mode).stroke};
  background: ${p => t(p.$mode).canvas};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.base};
  font-family: inherit;
  resize: none;
  
  &:focus {
    outline: none;
    border-color: ${p => t(p.$mode).action};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
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
