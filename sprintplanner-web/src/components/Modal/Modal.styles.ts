import styled from '@emotion/styled';
import { t, ThemeMode } from '@/styles';

export const StyledOverlay = styled.div<{ $mode: ThemeMode }>`
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

export const StyledModal = styled.div<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.lg};
  padding: ${t('dark').space.lg};
  min-width: 350px;
  max-width: 500px;
  box-shadow: ${t('dark').shadow.lg};
`;

export const StyledTitle = styled.h3<{ $mode: ThemeMode }>`
  margin-bottom: ${t('dark').space.md};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.md};
  font-weight: 600;
`;

export const StyledFooter = styled.div`
  margin-top: ${t('dark').space.lg};
  display: flex;
  gap: ${t('dark').space.sm};
  justify-content: flex-end;
`;

export const S = { StyledOverlay, StyledModal, StyledTitle, StyledFooter };
