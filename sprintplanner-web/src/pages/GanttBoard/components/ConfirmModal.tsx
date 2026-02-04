import styled from '@emotion/styled';
import { Modal, Button } from '@/components';
import { useStore } from '@/store';

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal = ({ title, message, onConfirm, onClose }: Props) => {
  const { theme } = useStore();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal title={title} onClose={onClose} footer={
      <>
        <Button $variant="secondary" onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleConfirm}>Löschen</Button>
      </>
    }>
      <Message $mode={theme}>{message}</Message>
    </Modal>
  );
};

const Message = styled.div<{ $mode: string }>`
  padding: 10px 0;
  color: ${p => p.$mode === 'dark' ? '#fff' : '#000'};
`;
