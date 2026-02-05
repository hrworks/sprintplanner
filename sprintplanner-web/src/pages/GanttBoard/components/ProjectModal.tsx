import { useState } from 'react';
import styled from '@emotion/styled';
import { Modal, Button } from '@/components';
import { useStore } from '@/store';
import { t, ThemeMode } from '@/styles';
import { DEFAULT_COLORS, STATUS_ICONS, Project } from '../types';
import { generateId } from '../store';

interface Props {
  project?: Project;
  onSave: (project: Project) => void;
  onClose: () => void;
}

export const ProjectModal = ({ project, onSave, onClose }: Props) => {
  const { theme } = useStore();
  const isEdit = !!project;
  
  const [form, setForm] = useState(() => ({
    name: project?.name || '',
    category: project?.category || '',
    description: project?.description || '',
    link: project?.link || '',
    status: (project?.status || '') as '' | 'ok' | 'warning' | 'delay' | 'complete',
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
      color: form.color,
      phases: project?.phases || [],
      _fieldUpdates: project?._fieldUpdates || {}
    });
  };

  return (
    <Modal title={isEdit ? 'Projekt bearbeiten' : 'Neues Projekt'} onClose={onClose} footer={
      <>
        <Button $variant="secondary" onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSave}>{isEdit ? 'Speichern' : 'Erstellen'}</Button>
      </>
    }>
      <FormGroup>
        <Label $mode={theme}>Projektname</Label>
        <Input $mode={theme} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="z.B. Workflow Automation" autoFocus />
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
            <StatusOption key={s} $mode={theme} $selected={form.status === s} onClick={() => setForm({ ...form, status: s })}>
              {STATUS_ICONS[s] || '—'} {s || 'Kein Status'}
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
    </Modal>
  );
};

const FormGroup = styled.div`
  margin-bottom: ${t('dark').space.md};
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
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  border-radius: ${t('dark').radius.md};
  cursor: pointer;
  font-size: ${t('dark').fontSize.xs};
  background: ${p => p.$selected ? t(p.$mode).action : t(p.$mode).panel};
  color: ${p => p.$selected ? 'white' : t(p.$mode).ink};
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
