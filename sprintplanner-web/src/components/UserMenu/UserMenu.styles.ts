import styled from '@emotion/styled';
import { t, ThemeMode } from '@/styles';

export const StyledWrapper = styled.div`
  position: relative;
`;

export const StyledTrigger = styled.div`
  cursor: pointer;
`;

export const StyledDropdown = styled.div<{ $mode: ThemeMode; $visible: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${t('dark').space.xs};
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  min-width: 220px;
  box-shadow: ${t('dark').shadow.lg};
  display: ${p => p.$visible ? 'block' : 'none'};
  z-index: 100;
  overflow: hidden;
`;

export const StyledHeader = styled.div<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.md};
  display: flex;
  gap: ${t('dark').space.md};
  align-items: center;
  border-bottom: 1px solid ${p => t(p.$mode).stroke};
`;

export const StyledName = styled.div<{ $mode: ThemeMode }>`
  font-weight: 500;
  color: ${p => t(p.$mode).ink};
`;

export const StyledEmail = styled.div<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkMuted};
`;

export const StyledItem = styled.button<{ $mode: ThemeMode }>`
  width: 100%;
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  color: ${p => t(p.$mode).ink};
  cursor: pointer;
  font-size: ${t('dark').fontSize.sm};
  transition: background ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).actionMuted};
  }
`;

export const StyledDivider = styled.div<{ $mode: ThemeMode }>`
  height: 1px;
  background: ${p => t(p.$mode).stroke};
`;

export const S = { StyledWrapper, StyledTrigger, StyledDropdown, StyledHeader, StyledName, StyledEmail, StyledItem, StyledDivider };
