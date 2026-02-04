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

export const StyledToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const StyledBackBtn = styled.button<{ $mode: ThemeMode }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: ${p => getColors(p.$mode).textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { 
    background: ${p => getColors(p.$mode).bgTertiary};
    color: ${p => getColors(p.$mode).textPrimary};
  }
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
  align-items: center;
`;

export const StyledCursorDropdown = styled.div<{ $mode: ThemeMode }>`
  position: relative;
  &:hover > div:last-child { display: block; }
`;

export const StyledCursorDropdownBtn = styled.button<{ $mode: ThemeMode }>`
  background: transparent;
  border: none;
  color: ${p => getColors(p.$mode).textSecondary};
  cursor: pointer;
  padding: 4px 8px;
  font-size: 12px;
  &:hover { color: ${p => getColors(p.$mode).textPrimary}; }
`;

export const StyledCursorDropdownMenu = styled.div<{ $mode: ThemeMode }>`
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: ${p => getColors(p.$mode).bgSecondary};
  border: 1px solid ${p => getColors(p.$mode).border};
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 1000;
  min-width: 250px;
`;

export const StyledCursorDropdownItem = styled.div<{ $mode: ThemeMode }>`
  padding: 10px 16px;
  cursor: pointer;
  font-size: 13px;
  color: ${p => getColors(p.$mode).textPrimary};
  white-space: nowrap;
  &:hover { background: ${p => getColors(p.$mode).bgTertiary}; }
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
  padding: 8px 12px;
  border-radius: 6px;
  height: 36px;
  box-sizing: border-box;
  
  label {
    font-size: 12px;
    color: ${p => getColors(p.$mode).textSecondary};
  }
`;

export const StyledDateInput = styled.input<{ $mode: ThemeMode }>`
  background: transparent;
  border: none;
  color: ${p => getColors(p.$mode).textPrimary};
  padding: 4px 8px;
  font-size: 13px;
  width: 120px;
  color-scheme: ${p => p.$mode === 'dark' ? 'dark' : 'light'};
  &:focus {
    outline: none;
  }
`;

export const StyledSlider = styled.input`
  width: 80px;
  accent-color: #e94560;
`;

export const StyledNavButtons = styled.div`
  display: flex;
  gap: 5px;
`;

export const StyledNavBtn = styled.button<{ $mode: ThemeMode }>`
  background: transparent;
  border: none;
  color: ${p => getColors(p.$mode).textSecondary};
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    color: ${p => getColors(p.$mode).textPrimary};
    background: ${p => getColors(p.$mode).bgTertiary};
  }
`;

export const StyledToggleBtn = styled.button<{ $mode: ThemeMode; $active: boolean }>`
  background: ${p => p.$active ? '#e94560' : getColors(p.$mode).bgPrimary};
  border: none;
  color: ${p => p.$active ? 'white' : getColors(p.$mode).textSecondary};
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  height: 36px;
  &:hover {
    background: ${p => p.$active ? '#d63850' : getColors(p.$mode).bgSecondary};
    color: ${p => p.$active ? 'white' : getColors(p.$mode).textPrimary};
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

export const StyledKwBadge = styled.span<{ $mode: ThemeMode }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  background: ${p => getColors(p.$mode).bgTertiary};
  color: ${p => getColors(p.$mode).textSecondary};
  margin-left: 8px;
`;

export const S = {
  StyledContainer, StyledToolbar, StyledTitleGroup, StyledToolbarRight, StyledBackBtn, StyledBoardName, StyledIconBtn,
  StyledCursorSettings, StyledActiveUsers, StyledCursorDropdown, StyledCursorDropdownBtn,
  StyledCursorDropdownMenu, StyledCursorDropdownItem, StyledMainContainer, StyledSidebar,
  StyledSidebarHeader, StyledBtnGroup, StyledProjectList, StyledMainContent,
  StyledChartToolbar, StyledToolbarLeft, StyledToolbarGroup, StyledDateInput,
  StyledSlider, StyledNavButtons, StyledNavBtn, StyledToggleBtn, StyledGanttOuter,
  StyledDetailPanel, StyledDetailHeader, StyledDetailContent,
  StyledFormGroup, StyledLabel, StyledInput, StyledTextarea, StyledKwBadge
};
