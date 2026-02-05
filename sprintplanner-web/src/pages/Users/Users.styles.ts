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

export const Row = styled.div<{ $mode: ThemeMode }>`
  display: grid;
  grid-template-columns: auto 1fr auto auto auto auto;
  gap: ${t('dark').space.md};
  padding: ${t('dark').space.md};
  border-bottom: 1px solid ${p => t(p.$mode).strokeSubtle};
  align-items: center;
  transition: background ${t('dark').transition.fast};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${p => t(p.$mode).panel};
  }
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
  StyledRow: Row,
  StyledUserInfo: UserInfo,
  StyledUserName: UserName,
  StyledUserEmail: UserEmail,
  StyledBoardStats: BoardStats,
  StyledStatus: Status,
  StyledSelect: Select,
  StyledRoleLabel: RoleLabel,
  StyledInput: Input,
  StyledEmpty: Empty,
};
