import { useState } from 'react';
import styled from '@emotion/styled';
import { Modal, Button } from '@/components';
import { useStore } from '@/store';
import { t, ThemeMode } from '@/styles';
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

const Row = styled.div`
  display: flex;
  gap: ${t('dark').space.md};
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
  color-scheme: ${p => p.$mode === 'dark' ? 'dark' : 'light'};
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

const ColorPicker = styled.div`
  display: flex;
  gap: ${t('dark').space.sm};
  flex-wrap: wrap;
`;

const ColorOption = styled.div<{ $mode: ThemeMode; $color: string; $selected: boolean }>`
  width: 24px;
  height: 24px;
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
