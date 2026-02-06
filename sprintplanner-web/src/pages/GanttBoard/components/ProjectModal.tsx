import { useState } from 'react';
import styled from '@emotion/styled';
import { Modal, Button } from '@/components';
import { useStore } from '@/store';
import { t, ThemeMode } from '@/styles';
import { DEFAULT_COLORS, Project } from '../types';
import { generateId } from '../store';
import { generatePhaseName } from '../utils/nameGenerator';

export const StatusIcon = ({ status, size = 18 }: { status: string; size?: number }) => {
  switch (status) {
    case 'ok':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#10b981"/><path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'warning':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3L2 21h20L12 3z" fill="#f59e0b"/><path d="M12 10v4M12 17v.5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>;
    case 'delay':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#ef4444"/><path d="M12 7v5l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'complete':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" fill="#6366f1"/><path d="M7 13l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    default:
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#6b7280" strokeWidth="2" strokeDasharray="4 2"/></svg>;
  }
};

interface Props {
  project?: Project;
  onSave: (project: Project) => void;
  onClose: () => void;
}

export const ProjectModal = ({ project, onSave, onClose }: Props) => {
  const { theme } = useStore();
  const isEdit = !!project;
  
  const [form, setForm] = useState(() => ({
    name: project?.name || generatePhaseName(),
    category: project?.category || '',
    description: project?.description || '',
    link: project?.link || '',
    status: (project?.status || '') as '' | 'ok' | 'warning' | 'delay' | 'complete',
    statusNote: project?.statusNote || '',
    color: project?.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]
  }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({
      _id: project?._id || generateId('p'),
      name: form.name,
      category: form.category,
      description: form.description,
      link: form.link,
      status: form.status,
      statusNote: form.statusNote,
      color: form.color,
      phases: project?.phases || [],
      _fieldUpdates: project?._fieldUpdates || {}
    });
  };

  return (
    <Modal title={isEdit ? 'Projekt bearbeiten' : 'Neues Projekt'} onClose={onClose} width={form.status ? 850 : undefined} footer={
      <>
        <Button $variant="secondary" onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSave}>{isEdit ? 'Speichern' : 'Erstellen'}</Button>
      </>
    }>
      <ModalColumns $hasStatus={!!form.status}>
        <div>
          <FormGroup>
            <Label $mode={theme}>Projektname</Label>
            <InputWrapper>
              <Input $mode={theme} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="z.B. Workflow Automation" autoFocus />
              {form.name && <ClearBtn $mode={theme} onClick={() => setForm({ ...form, name: '' })}>×</ClearBtn>}
            </InputWrapper>
          </FormGroup>
          <FormGroup>
            <Label $mode={theme}>Kategorie</Label>
            <Input $mode={theme} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="z.B. Development, Marketing" />
          </FormGroup>
          <FormGroup>
            <Label $mode={theme}>Beschreibung</Label>
            <Textarea $mode={theme} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Projektbeschreibung" rows={2} />
          </FormGroup>
          <FormGroup>
            <Label $mode={theme}>Link</Label>
            <Input $mode={theme} type="url" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
          </FormGroup>
          <FormGroup>
            <Label $mode={theme}>Status</Label>
            <StatusSelect>
              {(['', 'ok', 'warning', 'delay', 'complete'] as const).map(s => (
                <StatusOption key={s} $mode={theme} $selected={form.status === s} onClick={() => setForm({ ...form, status: s })} title={s || 'Kein Status'}>
                  <StatusIcon status={s} />
                </StatusOption>
              ))}
            </StatusSelect>
          </FormGroup>
          <FormGroup>
            <Label $mode={theme}>Farbe</Label>
            <ColorPicker>
              {DEFAULT_COLORS.map(c => (
                <ColorOption key={c} $mode={theme} $color={c} $selected={form.color === c} onClick={() => setForm({ ...form, color: c })} />
              ))}
            </ColorPicker>
          </FormGroup>
        </div>
        {form.status && (
          <StatusNoteColumn>
            <Label $mode={theme}>Statusnotiz</Label>
            <Textarea $mode={theme} value={form.statusNote} onChange={e => setForm({ ...form, statusNote: e.target.value })} placeholder="Warum dieser Status? Aktueller Stand..." style={{ flex: 1 }} />
          </StatusNoteColumn>
        )}
      </ModalColumns>
    </Modal>
  );
};

const ModalColumns = styled.div<{ $hasStatus: boolean }>`
  display: flex;
  gap: ${t('dark').space.lg};
  
  > div:first-of-type {
    width: 320px;
    flex-shrink: 0;
  }
`;

const StatusNoteColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 300px;
`;

const FormGroup = styled.div`
  margin-bottom: ${t('dark').space.md};
`;

const InputWrapper = styled.div`
  position: relative;
`;

const ClearBtn = styled.button<{ $mode: ThemeMode }>`
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
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  border-radius: ${t('dark').radius.md};
  border: 1px solid ${p => t(p.$mode).stroke};
  background: ${p => t(p.$mode).canvas};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.sm};
  transition: border-color ${t('dark').transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${p => t(p.$mode).action};
  }
  
  &::placeholder {
    color: ${p => t(p.$mode).inkFaint};
  }
`;

const Textarea = styled.textarea<{ $mode: ThemeMode }>`
  width: 100%;
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  border-radius: ${t('dark').radius.md};
  border: 1px solid ${p => t(p.$mode).stroke};
  background: ${p => t(p.$mode).canvas};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.sm};
  resize: vertical;
  font-family: inherit;
  transition: border-color ${t('dark').transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${p => t(p.$mode).action};
  }
`;

const StatusSelect = styled.div`
  display: flex;
  gap: ${t('dark').space.sm};
  flex-wrap: wrap;
`;

const StatusOption = styled.div<{ $mode: ThemeMode; $selected: boolean }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${t('dark').radius.md};
  cursor: pointer;
  font-size: 18px;
  background: ${p => p.$selected ? t(p.$mode).action : t(p.$mode).panel};
  border: 2px solid ${p => p.$selected ? t(p.$mode).action : 'transparent'};
  transition: all ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => p.$selected ? t(p.$mode).actionHover : t(p.$mode).actionMuted};
  }
`;

const ColorPicker = styled.div`
  display: flex;
  gap: ${t('dark').space.sm};
  flex-wrap: wrap;
`;

const ColorOption = styled.div<{ $mode: ThemeMode; $color: string; $selected: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: ${t('dark').radius.md};
  cursor: pointer;
  background: ${p => p.$color};
  border: 2px solid ${p => p.$selected ? 'white' : 'transparent'};
  box-shadow: ${p => p.$selected ? `0 0 0 2px ${t(p.$mode).action}` : 'none'};
  transition: transform ${t('dark').transition.fast};
  
  &:hover {
    transform: scale(1.1);
  }
`;
