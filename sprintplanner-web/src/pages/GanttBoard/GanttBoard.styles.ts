import styled from '@emotion/styled';
import { t, ThemeMode } from '@/styles';

// === LAYOUT ===
export const Container = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${p => t(p.$mode).canvas};
  color: ${p => t(p.$mode).ink};
  overflow: hidden;
  
  @media (max-width: 768px) {
    @media (orientation: portrait) {
      &::before {
        content: 'Bitte Gerät drehen';
        position: fixed;
        inset: 0;
        background: ${p => t(p.$mode).canvas};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        z-index: 9999;
      }
    }
  }
`;

// === TOOLBAR ===
export const Toolbar = styled.div<{ $mode: ThemeMode; $collapsed?: boolean }>`
  background: ${p => t(p.$mode).panel};
  padding: ${p => p.$collapsed ? `${t('dark').space.xs} ${t('dark').space.lg}` : `${t('dark').space.sm} ${t('dark').space.lg}`};
  display: flex;
  align-items: center;
  gap: ${t('dark').space.lg};
  border-bottom: 1px solid ${p => t(p.$mode).strokeSubtle};
  flex-shrink: 0;
  flex-wrap: nowrap;
  transition: padding 0.15s;
  
  @media (max-width: 768px) and (orientation: landscape) {
    display: none;
  }
`;

export const CollapseTopbarBtn = styled.button<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  color: ${p => t(p.$mode).ink};
  cursor: pointer;
  padding: ${t('dark').space.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).panel};
    border-color: ${p => t(p.$mode).action};
  }
`;

export const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  flex: 1;
`;

export const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.md};
  flex-shrink: 0;
`;

import { Link } from 'react-router-dom';

export const BackLink = styled(Link)`
  text-decoration: none;
`;

export const BackBtn = styled.button<{ $mode: ThemeMode }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${t('dark').space.sm};
  border-radius: 50%;
  color: ${p => t(p.$mode).inkMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${t('dark').transition.fast};
  
  &:hover { 
    background: ${p => t(p.$mode).actionMuted};
    color: ${p => t(p.$mode).ink};
  }
`;

export const BoardName = styled.span`
  font-weight: 600;
  font-size: ${t('dark').fontSize.md};
`;

export const BoardDesc = styled.span<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.sm};
  color: ${p => t(p.$mode).inkMuted};
  margin-left: ${t('dark').space.md};
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const IconBtn = styled.button<{ $mode: ThemeMode }>`
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${t('dark').fontSize.base};
  padding: ${t('dark').space.xs};
  color: ${p => t(p.$mode).inkFaint};
  transition: color ${t('dark').transition.fast};
  
  &:hover { color: ${p => t(p.$mode).ink}; }
`;

// === CURSOR SETTINGS ===
export const CursorSettings = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  gap: ${t('dark').space.md};
  font-size: ${t('dark').fontSize.base};
  color: ${p => t(p.$mode).inkMuted};
  
  label {
    display: flex;
    align-items: center;
    gap: ${t('dark').space.xs};
    cursor: pointer;
  }
`;

export const ActiveUsers = styled.div`
  display: flex;
  gap: ${t('dark').space.xs};
  align-items: center;
`;

export const CursorDropdownMenu = styled.div<{ $mode: ThemeMode }>`
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  box-shadow: ${t('dark').shadow.lg};
  z-index: 1000;
  min-width: 250px;
  padding-top: 4px;
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 10px;
  }
`;

export const CursorDropdown = styled.div<{ $mode: ThemeMode }>`
  position: relative;
  
  &:hover > div:last-of-type {
    display: block;
  }
`;

export const CursorDropdownBtn = styled.button<{ $mode: ThemeMode }>`
  background: transparent;
  border: none;
  color: ${p => t(p.$mode).inkMuted};
  cursor: pointer;
  padding: ${t('dark').space.xs} ${t('dark').space.sm};
  font-size: ${t('dark').fontSize.xs};
  transition: color ${t('dark').transition.fast};
  
  &:hover { color: ${p => t(p.$mode).ink}; }
`;

export const CursorDropdownItem = styled.div<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  cursor: pointer;
  font-size: ${t('dark').fontSize.sm};
  color: ${p => t(p.$mode).ink};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  transition: background ${t('dark').transition.fast};
  
  &:hover { background: ${p => t(p.$mode).actionMuted}; }
`;

export const CheckIcon = styled.span<{ $visible: boolean }>`
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    display: ${p => p.$visible ? 'block' : 'none'};
    width: 10px;
    height: 6px;
    border-left: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(-45deg);
    margin-bottom: 2px;
  }
`;

// === MAIN LAYOUT ===
export const MainContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export const Sidebar = styled.div<{ $mode: ThemeMode }>`
  width: 380px;
  background: ${p => t(p.$mode).board};
  border-right: 1px solid ${p => t(p.$mode).stroke};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
`;

export const SidebarHeader = styled.div<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.lg};
  background: ${p => t(p.$mode).panel};
  border-bottom: 1px solid ${p => t(p.$mode).strokeSubtle};
`;

export const BtnGroup = styled.div`
  display: flex;
  gap: ${t('dark').space.sm};
  flex-wrap: wrap;
`;

export const ProjectList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${t('dark').space.sm};
`;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
`;

// === CHART TOOLBAR ===
export const ChartToolbar = styled.div<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.md} ${t('dark').space.lg};
  background: ${p => t(p.$mode).panel};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${p => t(p.$mode).strokeSubtle};
  flex-wrap: nowrap;
  gap: ${t('dark').space.sm};
  
  @media (max-width: 768px) and (orientation: landscape) {
    display: none;
  }
`;

export const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.md};
  flex-wrap: nowrap;
`;

export const ToolbarGroup = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  background: ${p => t(p.$mode).canvas};
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  border-radius: ${t('dark').radius.md};
  height: 36px;
  box-sizing: border-box;
  
  label {
    font-size: ${t('dark').fontSize.xs};
    color: ${p => t(p.$mode).inkMuted};
  }
`;

export const DateInput = styled.input<{ $mode: ThemeMode }>`
  background: transparent;
  border: none;
  color: ${p => t(p.$mode).inkMuted};
  padding: ${t('dark').space.xs} ${t('dark').space.sm};
  font-size: ${t('dark').fontSize.sm};
  font-family: inherit;
  width: 120px;
  color-scheme: ${p => p.$mode === 'dark' ? 'dark' : 'light'};
  
  &:focus { outline: none; }
  
  &::-webkit-datetime-edit { font-family: inherit; }
  &::-webkit-calendar-picker-indicator { cursor: pointer; }
`;

export const Slider = styled.input`
  width: 80px;
  accent-color: #6366f1;
`;

export const NavButtons = styled.div`
  display: flex;
  gap: ${t('dark').space.xs};
`;

export const NavBtn = styled.button<{ $mode: ThemeMode }>`
  background: transparent;
  border: none;
  color: ${p => t(p.$mode).inkMuted};
  padding: ${t('dark').space.xs} ${t('dark').space.sm};
  border-radius: ${t('dark').radius.sm};
  cursor: pointer;
  font-size: ${t('dark').fontSize.base};
  transition: all ${t('dark').transition.fast};
  
  &:hover {
    color: ${p => t(p.$mode).ink};
    background: ${p => t(p.$mode).actionMuted};
  }
`;

export const ToggleBtn = styled.button<{ $mode: ThemeMode; $active: boolean }>`
  background: ${p => p.$active ? t(p.$mode).action : t(p.$mode).canvas};
  border: none;
  color: ${p => p.$active ? 'white' : t(p.$mode).inkMuted};
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  border-radius: ${t('dark').radius.md};
  cursor: pointer;
  font-size: ${t('dark').fontSize.xs};
  height: 36px;
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  transition: all ${t('dark').transition.fast};
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background: ${p => p.$active ? t(p.$mode).actionHover : t(p.$mode).board};
    color: ${p => p.$active ? 'white' : t(p.$mode).ink};
  }
`;

export const SliderPopover = styled.div<{ $mode: ThemeMode; $compact?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  background: ${p => t(p.$mode).canvas};
  padding: 0 ${t('dark').space.md};
  border-radius: ${t('dark').radius.md};
  height: 36px;
  flex-shrink: 0;
  
  label {
    font-size: ${t('dark').fontSize.xs};
    color: ${p => t(p.$mode).inkMuted};
  }
  
  .inline-slider {
    display: flex;
    align-items: center;
    gap: ${t('dark').space.sm};
  }
`;

export const SliderBtn = styled.button<{ $mode: ThemeMode }>`
  background: transparent;
  border: none;
  color: ${p => t(p.$mode).inkMuted};
  padding: ${t('dark').space.sm};
  border-radius: ${t('dark').radius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).board};
    color: ${p => t(p.$mode).ink};
    
    + div {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
  }
`;

export const SliderDropdown = styled.div<{ $mode: ThemeMode }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  padding-top: ${t('dark').space.sm};
  opacity: 0;
  visibility: hidden;
  transition: all 0.15s ease;
  z-index: 100;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: ${t('dark').space.sm};
  }
  
  > div {
    background: ${p => t(p.$mode).board};
    border: 1px solid ${p => t(p.$mode).stroke};
    border-radius: ${t('dark').radius.md};
    padding: ${t('dark').space.md};
    box-shadow: ${t('dark').shadow.lg};
    display: flex;
    flex-direction: column;
    gap: ${t('dark').space.sm};
  }
  
  &:hover {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
  align-items: center;
  gap: ${t('dark').space.sm};
  min-width: 120px;
  
  input[type="range"] {
    width: 100px;
  }
  
  span {
    font-size: ${t('dark').fontSize.xs};
    color: ${p => t(p.$mode).inkMuted};
  }
`;

// === GANTT AREA ===
export const GanttOuter = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

// === DETAIL PANEL ===
export const DetailPanel = styled.div<{ $mode: ThemeMode; $visible: boolean }>`
  width: 320px;
  background: ${p => t(p.$mode).board};
  border-left: 1px solid ${p => t(p.$mode).stroke};
  display: ${p => p.$visible ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
`;

export const DetailHeader = styled.div<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.md};
  background: ${p => t(p.$mode).panel};
  border-bottom: 1px solid ${p => t(p.$mode).strokeSubtle};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    color: ${p => t(p.$mode).action};
    font-size: ${t('dark').fontSize.sm};
    font-weight: 600;
  }
`;

export const DetailContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${t('dark').space.md};
`;

export const FormGroup = styled.div`
  margin-bottom: ${t('dark').space.md};
`;

export const Label = styled.label<{ $mode: ThemeMode }>`
  display: block;
  margin-bottom: ${t('dark').space.xs};
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkMuted};
`;

export const Input = styled.input<{ $mode: ThemeMode }>`
  width: 100%;
  padding: ${t('dark').space.sm} ${t('dark').space.sm};
  border-radius: ${t('dark').radius.md};
  border: 1px solid ${p => t(p.$mode).stroke};
  background: ${p => t(p.$mode).canvas};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.sm};
  transition: border-color ${t('dark').transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${p => t(p.$mode).action};
  }
`;

export const Textarea = styled.textarea<{ $mode: ThemeMode }>`
  width: 100%;
  padding: ${t('dark').space.sm};
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

export const KwBadge = styled.span<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.xs} ${t('dark').space.sm};
  border-radius: ${t('dark').radius.sm};
  font-size: ${t('dark').fontSize.xs};
  background: ${p => t(p.$mode).actionMuted};
  color: ${p => t(p.$mode).action};
  margin-left: ${t('dark').space.sm};
`;

// Export mit alten Namen für Kompatibilität
export const S = {
  StyledContainer: Container,
  StyledToolbar: Toolbar,
  StyledTitleGroup: TitleGroup,
  StyledToolbarRight: ToolbarRight,
  StyledBackLink: BackLink,
  StyledBackBtn: BackBtn,
  StyledBoardName: BoardName,
  StyledBoardDesc: BoardDesc,
  StyledIconBtn: IconBtn,
  StyledCursorSettings: CursorSettings,
  StyledActiveUsers: ActiveUsers,
  StyledCollapseTopbarBtn: CollapseTopbarBtn,
  StyledCursorDropdown: CursorDropdown,
  StyledCursorDropdownBtn: CursorDropdownBtn,
  StyledCursorDropdownMenu: CursorDropdownMenu,
  StyledCursorDropdownItem: CursorDropdownItem,
  StyledCheckIcon: CheckIcon,
  StyledMainContainer: MainContainer,
  StyledSidebar: Sidebar,
  StyledSidebarHeader: SidebarHeader,
  StyledBtnGroup: BtnGroup,
  StyledProjectList: ProjectList,
  StyledMainContent: MainContent,
  StyledChartToolbar: ChartToolbar,
  StyledToolbarLeft: ToolbarLeft,
  StyledToolbarGroup: ToolbarGroup,
  StyledDateInput: DateInput,
  StyledSlider: Slider,
  StyledNavButtons: NavButtons,
  StyledNavBtn: NavBtn,
  StyledToggleBtn: ToggleBtn,
  StyledSliderPopover: SliderPopover,
  StyledSliderBtn: SliderBtn,
  StyledSliderDropdown: SliderDropdown,
  StyledGanttOuter: GanttOuter,
  StyledDetailPanel: DetailPanel,
  StyledDetailHeader: DetailHeader,
  StyledDetailContent: DetailContent,
  StyledFormGroup: FormGroup,
  StyledLabel: Label,
  StyledInput: Input,
  StyledTextarea: Textarea,
  StyledKwBadge: KwBadge,
};
