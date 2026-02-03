import styled from '@emotion/styled';
import { getColors } from '@/styles';
import { ThemeMode } from '@/styles';

export const StyledOverlay = styled.div<{ $mode: ThemeMode }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const StyledModal = styled.div<{ $mode: ThemeMode }>`
  background: ${p => getColors(p.$mode).bgSecondary};
  border-radius: 12px;
  padding: 24px;
  min-width: 350px;
  max-width: 500px;
`;

export const StyledTitle = styled.h3<{ $mode: ThemeMode }>`
  margin-bottom: 16px;
  color: ${p => getColors(p.$mode).accent};
`;

export const StyledFooter = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

export const S = { StyledOverlay, StyledModal, StyledTitle, StyledFooter };
