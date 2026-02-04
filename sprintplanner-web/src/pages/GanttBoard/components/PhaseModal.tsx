import { useState } from 'react';
import styled from '@emotion/styled';
import { Modal, Button } from '@/components';
import { useStore } from '@/store';
import { DEFAULT_COLORS, Phase } from '../types';
import { generateId } from '../store';

interface Props {
  projectId: string;
  phase?: Phase;
  onSave: (projectId: string, phase: Phase) => void;
  onClose: () => void;
}

export const PhaseModal = ({ projectId, phase, onSave, onClose }: Props) => {
  const { theme } = useStore();
  const isEdit = !!phase;
  
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [form, setForm] = useState({
    name: phase?.name || '',
    subtitle: phase?.subtitle || '',
    description: phase?.description || '',
    link: phase?.link || '',
    start: phase?.start || today,
    end: phase?.end || nextWeek,
    color: phase?.color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]
  });

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave(projectId, {
      _id: phase?._id || generateId('ph'),
      name: form.name,
      subtitle: form.subtitle,
      description: form.description,
      link: form.link,
      start: form.start,
      end: form.end,
      color: form.color,
      showStartLine: phase?.showStartLine || false,
      showEndLine: phase?.showEndLine || false,
      _fieldUpdates: phase?._fieldUpdates || {}
    });
  };

  return (
    <Modal title={isEdit ? 'Phase bearbeiten' : 'Neue Phase'} onClose={onClose} footer={
      <>
        <Button $variant="secondary" onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSave}>{isEdit ? 'Speichern' : 'Erstellen'}</Button>
      </>
    }>
      <FormGroup>
        <Label $mode={theme}>Name</Label>
        <Input $mode={theme} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Phasenname" autoFocus />
      </FormGroup>
      <FormGroup>
        <Label $mode={theme}>Untertitel</Label>
        <Input $mode={theme} value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="z.B. Sprint 1" />
      </FormGroup>
      <Row>
        <FormGroup style={{ flex: 1 }}>
          <Label $mode={theme}>Start</Label>
          <Input $mode={theme} type="date" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} />
        </FormGroup>
        <FormGroup style={{ flex: 1 }}>
          <Label $mode={theme}>Ende</Label>
          <Input $mode={theme} type="date" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} />
        </FormGroup>
      </Row>
      <FormGroup>
        <Label $mode={theme}>Beschreibung</Label>
        <Textarea $mode={theme} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
      </FormGroup>
      <FormGroup>
        <Label $mode={theme}>Link</Label>
        <Input $mode={theme} type="url" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
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
const Row = styled.div`display: flex; gap: 12px;`;
const Label = styled.label<{ $mode: string }>`display: block; margin-bottom: 4px; font-size: 12px; color: ${p => p.$mode === 'dark' ? '#aaa' : '#555'};`;
const Input = styled.input<{ $mode: string }>`
  width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid ${p => p.$mode === 'dark' ? '#444' : '#ddd'};
  background: ${p => p.$mode === 'dark' ? '#2a2a2a' : '#fff'}; color: ${p => p.$mode === 'dark' ? '#fff' : '#000'}; font-size: 13px;
  color-scheme: ${p => p.$mode === 'dark' ? 'dark' : 'light'};
`;
const Textarea = styled.textarea<{ $mode: string }>`
  width: 100%; padding: 8px 10px; border-radius: 6px; border: 1px solid ${p => p.$mode === 'dark' ? '#444' : '#ddd'};
  background: ${p => p.$mode === 'dark' ? '#2a2a2a' : '#fff'}; color: ${p => p.$mode === 'dark' ? '#fff' : '#000'}; font-size: 13px; resize: vertical;
`;
const ColorPicker = styled.div`display: flex; gap: 6px; flex-wrap: wrap;`;
const ColorOption = styled.div<{ $color: string; $selected: boolean }>`
  width: 24px; height: 24px; border-radius: 4px; cursor: pointer;
  background: ${p => p.$color}; border: 2px solid ${p => p.$selected ? '#fff' : 'transparent'};
  box-shadow: ${p => p.$selected ? '0 0 0 2px #e94560' : 'none'};
  &:hover { transform: scale(1.1); }
`;
