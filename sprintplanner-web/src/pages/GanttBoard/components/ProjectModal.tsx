import { useState } from 'react';
import styled from '@emotion/styled';
import { Modal, Button } from '@/components';
import { useStore } from '@/store';
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
  
  const [form, setForm] = useState({
    name: project?.name || '',
    category: project?.category || '',
    description: project?.description || '',
    link: project?.link || '',
    status: (project?.status || '') as '' | 'ok' | 'warning' | 'delay' | 'complete',
    color: project?.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]
  });

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
            <StatusOption key={s} $selected={form.status === s} onClick={() => setForm({ ...form, status: s })}>
              {STATUS_ICONS[s] || '—'} {s || 'Kein Status'}
            </StatusOption>
          ))}
        </StatusSelect>
      </FormGroup>
      <FormGroup>
        <Label $mode={theme}>Farbe</Label>
        <ColorPicker>
          {DEFAULT_COLORS.map(c => (
            <ColorOption key={c} $color={c} $selected={form.color === c} onClick={() => setForm({ ...form, color: c })} />
          ))}
        </ColorPicker>
      </FormGroup>
    </Modal>
  );
};

const FormGroup = styled.div`margin-bottom: 12px;`;
const Label = styled.label<{ $mode: string }>`display: block; margin-bottom: 4px; font-size: 12px; color: ${p => p.$mode === 'dark' ? '#aaa' : '#555'};`;
const Input = styled.input<{ $mode: string }>`
  width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid ${p => p.$mode === 'dark' ? '#444' : '#ddd'};
  background: ${p => p.$mode === 'dark' ? '#2a2a2a' : '#fff'}; color: ${p => p.$mode === 'dark' ? '#fff' : '#000'}; font-size: 13px;
`;
const Textarea = styled.textarea<{ $mode: string }>`
  width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid ${p => p.$mode === 'dark' ? '#444' : '#ddd'};
  background: ${p => p.$mode === 'dark' ? '#2a2a2a' : '#fff'}; color: ${p => p.$mode === 'dark' ? '#fff' : '#000'}; font-size: 13px; resize: vertical;
`;
const StatusSelect = styled.div`display: flex; gap: 6px; flex-wrap: wrap;`;
const StatusOption = styled.div<{ $selected: boolean }>`
  padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px;
  background: ${p => p.$selected ? '#e94560' : '#333'}; color: #fff;
  &:hover { opacity: 0.8; }
`;
const ColorPicker = styled.div`display: flex; gap: 6px; flex-wrap: wrap;`;
const ColorOption = styled.div<{ $color: string; $selected: boolean }>`
  width: 28px; height: 28px; border-radius: 6px; cursor: pointer;
  background: ${p => p.$color}; border: 2px solid ${p => p.$selected ? '#fff' : 'transparent'};
  box-shadow: ${p => p.$selected ? '0 0 0 2px #e94560' : 'none'};
  &:hover { transform: scale(1.1); }
`;
