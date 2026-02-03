import styled from '@emotion/styled';
import { getColors } from '@/styles';
import { ThemeMode } from '@/styles';

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
  margin-top: 8px;
  background: ${p => getColors(p.$mode).bgSecondary};
  border: 1px solid ${p => getColors(p.$mode).border};
  border-radius: 8px;
  min-width: 220px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: ${p => p.$visible ? 'block' : 'none'};
  z-index: 100;
`;

export const StyledHeader = styled.div<{ $mode: ThemeMode }>`
  padding: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid ${p => getColors(p.$mode).border};
`;

export const StyledName = styled.div<{ $mode: ThemeMode }>`
  font-weight: 500;
  color: ${p => getColors(p.$mode).textPrimary};
`;

export const StyledEmail = styled.div<{ $mode: ThemeMode }>`
  font-size: 12px;
  color: ${p => getColors(p.$mode).textSecondary};
`;

export const StyledItem = styled.button<{ $mode: ThemeMode }>`
  width: 100%;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  color: ${p => getColors(p.$mode).textPrimary};
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: ${p => getColors(p.$mode).bgTertiary};
  }
`;

export const StyledDivider = styled.div<{ $mode: ThemeMode }>`
  height: 1px;
  background: ${p => getColors(p.$mode).border};
`;

export const S = { StyledWrapper, StyledTrigger, StyledDropdown, StyledHeader, StyledName, StyledEmail, StyledItem, StyledDivider };
