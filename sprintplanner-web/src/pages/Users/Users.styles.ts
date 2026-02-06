import styled from '@emotion/styled';
import { t, ThemeMode } from '@/styles';

// === LAYOUT ===
export const Container = styled.div<{ $mode: ThemeMode }>`
  min-height: 100vh;
  background: ${p => t(p.$mode).canvas};
`;

export const Header = styled.header<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).board};
  padding: ${t('dark').space.md} ${t('dark').space.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${p => t(p.$mode).strokeSubtle};
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.md};
`;

export const Title = styled.h1<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.lg};
  font-weight: 600;
`;

export const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${t('dark').space.xxl} ${t('dark').space.lg};
`;

// === SECTION ===
export const Section = styled.section`
  margin-bottom: ${t('dark').space.xxl};
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${t('dark').space.md};
`;

export const SectionTitle = styled.h2<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkMuted};
  font-size: ${t('dark').fontSize.xs};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// === TABLE ===
export const Table = styled.div<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.lg};
  overflow: hidden;
`;

export const UserItem = styled.div``;

export const Row = styled.div<{ $mode: ThemeMode; $expandable?: boolean }>`
  display: grid;
  grid-template-columns: ${p => p.$expandable ? 'auto auto 1fr auto auto auto auto' : 'auto 1fr auto auto auto auto'};
  gap: ${t('dark').space.md};
  padding: ${t('dark').space.md};
  border-bottom: 1px solid ${p => t(p.$mode).strokeSubtle};
  align-items: center;
  transition: background ${t('dark').transition.fast};
  cursor: ${p => p.$expandable ? 'pointer' : 'default'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${p => t(p.$mode).panel};
  }
`;

export const ExpandIcon = styled.span<{ $expanded: boolean }>`
  font-size: 10px;
  transition: transform 0.15s;
  transform: rotate(${p => p.$expanded ? '90deg' : '0deg'});
`;

export const UserInfo = styled.div``;

export const UserName = styled.div<{ $mode: ThemeMode }>`
  font-weight: 500;
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.base};
`;

export const UserEmail = styled.div<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkMuted};
`;

export const BoardStats = styled.span<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkFaint};
`;

export const Status = styled.span<{ $mode: ThemeMode; $status: 'active' | 'pending' }>`
  padding: ${t('dark').space.xs} ${t('dark').space.sm};
  border-radius: ${t('dark').radius.sm};
  font-size: ${t('dark').fontSize.xs};
  font-weight: 500;
  background: ${p => p.$status === 'active' ? t(p.$mode).successMuted : 'rgba(251, 191, 36, 0.15)'};
  color: ${p => p.$status === 'active' ? t(p.$mode).success : '#fbbf24'};
`;

export const Select = styled.select<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.xs} ${t('dark').space.sm};
  border-radius: ${t('dark').radius.sm};
  background: ${p => t(p.$mode).panel};
  color: ${p => t(p.$mode).ink};
  border: 1px solid ${p => t(p.$mode).stroke};
  font-size: ${t('dark').fontSize.xs};
  cursor: pointer;
  transition: border-color ${t('dark').transition.fast};
  
  &:hover {
    border-color: ${p => t(p.$mode).action};
  }
`;

export const RoleLabel = styled.span<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkMuted};
  padding: ${t('dark').space.xs} ${t('dark').space.sm};
`;

export const Input = styled.input<{ $mode: ThemeMode }>`
  width: 100%;
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  background: ${p => t(p.$mode).canvas};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.base};
  transition: border-color ${t('dark').transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${p => t(p.$mode).action};
  }
  
  &::placeholder {
    color: ${p => t(p.$mode).inkFaint};
  }
`;

export const Empty = styled.div<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkMuted};
  padding: ${t('dark').space.xxl};
  text-align: center;
  background: ${p => t(p.$mode).board};
  border: 1px dashed ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.lg};
`;

export const ChipContainer = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${t('dark').space.sm};
  padding: ${t('dark').space.sm};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  min-height: 44px;
  align-items: center;
  
  &:focus-within {
    border-color: ${p => t(p.$mode).action};
  }
`;

export const Chip = styled.span<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.xs};
  padding: ${t('dark').space.xs} ${t('dark').space.sm};
  background: ${p => t(p.$mode).actionMuted};
  color: ${p => t(p.$mode).action};
  border-radius: ${t('dark').radius.full};
  font-size: ${t('dark').fontSize.sm};
`;

export const ChipRemove = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: inherit;
  padding: 0;
  line-height: 1;
`;

export const ChipInput = styled.input<{ $mode: ThemeMode }>`
  flex: 1;
  min-width: 150px;
  border: none;
  background: transparent;
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.base};
  
  &:focus { outline: none; }
  &::placeholder { color: ${p => t(p.$mode).inkFaint}; }
`;

// === BOARD LIST (Accordion) ===
export const BoardList = styled.div<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).canvas};
  border-top: 1px solid ${p => t(p.$mode).strokeSubtle};
  padding: ${t('dark').space.sm} ${t('dark').space.md} ${t('dark').space.sm} 60px;
`;

export const BoardItem = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.md};
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  border-radius: ${t('dark').radius.md};
  text-decoration: none;
  transition: background ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).panel};
  }
`;

export const BoardInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const BoardName = styled.div<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).ink};
  font-weight: 500;
  font-size: ${t('dark').fontSize.sm};
`;

export const BoardDesc = styled.div<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkMuted};
  font-size: ${t('dark').fontSize.xs};
  margin-top: 2px;
`;

export const BoardMeta = styled.div<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkFaint};
  font-size: ${t('dark').fontSize.xs};
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: ${t('dark').space.md};
`;

export const BoardMembers = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: ${t('dark').space.sm};
  
  span {
    font-size: 10px;
    margin-left: 2px;
  }
`;

export const BoardMinimap = styled.div<{ $mode: ThemeMode }>`
  width: 120px;
  background: ${p => t(p.$mode).canvas};
  border-radius: ${t('dark').radius.sm};
  flex-shrink: 0;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const MinimapRow = styled.div`
  height: 4px;
  position: relative;
`;

export const MinimapPhase = styled.div`
  position: absolute;
  height: 100%;
  border-radius: 2px;
`;

// Export mit alten Namen für Kompatibilität
export const S = {
  StyledContainer: Container,
  StyledHeader: Header,
  StyledHeaderLeft: HeaderLeft,
  StyledTitle: Title,
  StyledContent: Content,
  StyledSection: Section,
  StyledSectionHeader: SectionHeader,
  StyledSectionTitle: SectionTitle,
  StyledTable: Table,
  StyledUserItem: UserItem,
  StyledRow: Row,
  StyledExpandIcon: ExpandIcon,
  StyledUserInfo: UserInfo,
  StyledUserName: UserName,
  StyledUserEmail: UserEmail,
  StyledBoardStats: BoardStats,
  StyledStatus: Status,
  StyledSelect: Select,
  StyledRoleLabel: RoleLabel,
  StyledInput: Input,
  StyledEmpty: Empty,
  StyledChipContainer: ChipContainer,
  StyledChip: Chip,
  StyledChipRemove: ChipRemove,
  StyledChipInput: ChipInput,
  StyledBoardList: BoardList,
  StyledBoardItem: BoardItem,
  StyledBoardInfo: BoardInfo,
  StyledBoardName: BoardName,
  StyledBoardDesc: BoardDesc,
  StyledBoardMeta: BoardMeta,
  StyledBoardMembers: BoardMembers,
  StyledBoardMinimap: BoardMinimap,
  StyledMinimapRow: MinimapRow,
  StyledMinimapPhase: MinimapPhase,
};
