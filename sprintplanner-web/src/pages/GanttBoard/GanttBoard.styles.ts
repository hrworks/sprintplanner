import styled from '@emotion/styled';
import { getColors } from '@/styles';
import { ThemeMode } from '@/styles';

export const StyledContainer = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${p => getColors(p.$mode).bgPrimary};
  color: ${p => getColors(p.$mode).textPrimary};
  overflow: hidden;
`;

export const StyledToolbar = styled.div<{ $mode: ThemeMode }>`
  background: ${p => getColors(p.$mode).bgTertiary};
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid ${p => getColors(p.$mode).border};
  flex-shrink: 0;
`;

export const StyledTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

export const StyledBoardName = styled.span`
  font-weight: 600;
  font-size: 16px;
`;

export const StyledIconBtn = styled.button<{ $mode: ThemeMode }>`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  opacity: 0.5;
  color: ${p => getColors(p.$mode).textPrimary};
  &:hover { opacity: 1; }
`;

export const StyledCursorSettings = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  gap: 12px;
  font-size: 14px;
  color: ${p => getColors(p.$mode).textSecondary};
  label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
`;

export const StyledActiveUsers = styled.div`
  display: flex;
  gap: 4px;
`;

export const StyledMainContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export const StyledSidebar = styled.div<{ $mode: ThemeMode }>`
  width: 380px;
  background: ${p => getColors(p.$mode).bgSecondary};
  border-right: 1px solid ${p => getColors(p.$mode).border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
`;

export const StyledSidebarHeader = styled.div<{ $mode: ThemeMode }>`
  padding: 20px;
  background: ${p => getColors(p.$mode).bgTertiary};
  border-bottom: 1px solid ${p => getColors(p.$mode).bgPrimary};
`;

export const StyledBtnGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const StyledProjectList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

export const StyledMainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
`;

export const StyledChartToolbar = styled.div<{ $mode: ThemeMode }>`
  padding: 12px 20px;
  background: ${p => getColors(p.$mode).bgTertiary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${p => getColors(p.$mode).bgPrimary};
  flex-wrap: wrap;
  gap: 10px;
`;

export const StyledToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
`;

export const StyledToolbarGroup = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${p => getColors(p.$mode).bgPrimary};
  padding: 6px 12px;
  border-radius: 5px;
  
  label {
    font-size: 11px;
    color: ${p => getColors(p.$mode).textSecondary};
  }
`;

export const StyledDateInput = styled.input<{ $mode: ThemeMode }>`
  background: ${p => getColors(p.$mode).bgTertiary};
  border: 1px solid ${p => getColors(p.$mode).bgPrimary};
  color: ${p => getColors(p.$mode).textPrimary};
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 11px;
  width: 130px;
  &:focus {
    outline: none;
    border-color: ${p => getColors(p.$mode).accent};
  }
`;

export const StyledSlider = styled.input`
  width: 80px;
  accent-color: var(--accent);
`;

export const StyledNavButtons = styled.div`
  display: flex;
  gap: 5px;
`;

export const StyledNavBtn = styled.button<{ $mode: ThemeMode }>`
  background: ${p => getColors(p.$mode).bgPrimary};
  border: 1px solid ${p => getColors(p.$mode).border};
  color: ${p => getColors(p.$mode).textPrimary};
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background: ${p => getColors(p.$mode).accent};
    border-color: ${p => getColors(p.$mode).accent};
    color: white;
  }
`;

export const StyledGanttOuter = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

export const StyledDetailPanel = styled.div<{ $mode: ThemeMode; $visible: boolean }>`
  width: 320px;
  background: ${p => getColors(p.$mode).bgSecondary};
  border-left: 1px solid ${p => getColors(p.$mode).border};
  display: ${p => p.$visible ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
`;

export const StyledDetailHeader = styled.div<{ $mode: ThemeMode }>`
  padding: 15px;
  background: ${p => getColors(p.$mode).bgTertiary};
  border-bottom: 1px solid ${p => getColors(p.$mode).bgPrimary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    color: ${p => getColors(p.$mode).accent};
    font-size: 13px;
  }
`;

export const StyledDetailContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
`;

export const StyledFormGroup = styled.div`
  margin-bottom: 12px;
`;

export const StyledLabel = styled.label<{ $mode: ThemeMode }>`
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: ${p => getColors(p.$mode).textSecondary};
`;

export const StyledInput = styled.input<{ $mode: ThemeMode }>`
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid ${p => getColors(p.$mode).border};
  background: ${p => getColors(p.$mode).bgSecondary};
  color: ${p => getColors(p.$mode).textPrimary};
  font-size: 13px;
`;

export const StyledTextarea = styled.textarea<{ $mode: ThemeMode }>`
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid ${p => getColors(p.$mode).border};
  background: ${p => getColors(p.$mode).bgSecondary};
  color: ${p => getColors(p.$mode).textPrimary};
  font-size: 13px;
  resize: vertical;
`;

export const S = {
  StyledContainer, StyledToolbar, StyledTitleGroup, StyledBoardName, StyledIconBtn,
  StyledCursorSettings, StyledActiveUsers, StyledMainContainer, StyledSidebar,
  StyledSidebarHeader, StyledBtnGroup, StyledProjectList, StyledMainContent,
  StyledChartToolbar, StyledToolbarLeft, StyledToolbarGroup, StyledDateInput,
  StyledSlider, StyledNavButtons, StyledNavBtn, StyledGanttOuter,
  StyledDetailPanel, StyledDetailHeader, StyledDetailContent,
  StyledFormGroup, StyledLabel, StyledInput, StyledTextarea
};
