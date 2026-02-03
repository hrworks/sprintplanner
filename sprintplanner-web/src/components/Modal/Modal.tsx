import { S } from './Modal.styles';
import { ModalProps } from './Modal.types';
import { useStore } from '@/store';

export const Modal = ({ title, children, footer, onClose }: ModalProps) => {
  const theme = useStore((s) => s.theme);
  
  return (
    <S.StyledOverlay $mode={theme} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <S.StyledModal $mode={theme}>
        <S.StyledTitle $mode={theme}>{title}</S.StyledTitle>
        {children}
        {footer && <S.StyledFooter>{footer}</S.StyledFooter>}
      </S.StyledModal>
    </S.StyledOverlay>
  );
};
