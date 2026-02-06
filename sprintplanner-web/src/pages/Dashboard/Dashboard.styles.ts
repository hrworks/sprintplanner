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
  gap: ${t('dark').space.xl};
`;

export const Nav = styled.nav`
  display: flex;
  gap: ${t('dark').space.lg};
`;

export const NavItem = styled.span<{ $mode: ThemeMode; $active?: boolean }>`
  color: ${p => p.$active ? t(p.$mode).ink : t(p.$mode).inkMuted};
  font-size: ${t('dark').fontSize.base};
  cursor: pointer;
  transition: color ${t('dark').transition.fast};
  
  &:hover {
    color: ${p => t(p.$mode).ink};
  }
`;

export const Title = styled.h1<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.lg};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
`;

export const SearchBtn = styled.button<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  background: ${p => t(p.$mode).panel};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  color: ${p => t(p.$mode).inkMuted};
  font-size: ${t('dark').fontSize.sm};
  cursor: pointer;
  transition: all ${t('dark').transition.fast};
  margin-right: ${t('dark').space.md};
  
  &:hover {
    border-color: ${p => t(p.$mode).action};
    color: ${p => t(p.$mode).ink};
  }
`;

export const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${t('dark').space.xxl} ${t('dark').space.lg};
`;

// === SECTIONS ===
export const Section = styled.section`
  margin-bottom: ${t('dark').space.xxl};
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${t('dark').space.md};
`;

export const SectionTitle = styled.h2<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkMuted};
  font-size: ${t('dark').fontSize.xs};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SectionCount = styled.span<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkFaint};
  font-size: ${t('dark').fontSize.xs};
`;

export const SectionActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.md};
`;

export const ViewToggle = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  background: ${p => t(p.$mode).canvas};
  border: 1px solid ${p => t(p.$mode).strokeSubtle};
  border-radius: ${t('dark').radius.sm};
  padding: 2px;
`;

export const ViewToggleBtn = styled.button<{ $mode: ThemeMode; $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: ${t('dark').radius.sm};
  background: ${p => p.$active ? t(p.$mode).board : 'transparent'};
  color: ${p => p.$active ? t(p.$mode).ink : t(p.$mode).inkMuted};
  cursor: pointer;
  transition: all ${t('dark').transition.fast};
  
  &:hover {
    color: ${p => t(p.$mode).ink};
  }
`;

export const Empty = styled.div<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkMuted};
  padding: ${t('dark').space.lg};
  text-align: center;
  background: ${p => t(p.$mode).board};
  border: 1px dashed ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.lg};
`;

export const EmptyIcon = styled.div<{ $mode: ThemeMode }>`
  font-size: 32px;
  margin-bottom: ${t('dark').space.sm};
  opacity: 0.3;
`;

export const EmptyText = styled.p<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkMuted};
  margin-bottom: ${t('dark').space.md};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${t('dark').space.md};
`;

// === CARD ===
import { Link } from 'react-router-dom';

export const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

export const Card = styled.div<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.lg};
  padding: ${t('dark').space.lg};
  cursor: pointer;
  transition: border-color ${t('dark').transition.fast}, box-shadow ${t('dark').transition.fast};
  display: flex;
  flex-direction: column;
  min-height: 200px;
  
  &:hover {
    border-color: ${p => t(p.$mode).action};
    box-shadow: 0 0 0 1px ${p => t(p.$mode).action};
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const CardTitle = styled.h3<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.md};
  font-weight: 500;
  margin-bottom: ${t('dark').space.xs};
`;

export const CardDesc = styled.p<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkMuted};
  font-size: ${t('dark').fontSize.sm};
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 20px;
`;

export const CardBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const CardMeta = styled.div<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkFaint};
  font-size: ${t('dark').fontSize.xs};
  margin-top: auto;
  padding-top: ${t('dark').space.sm};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${t('dark').space.sm};
`;

export const OwnerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.xs};
`;

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${t('dark').space.sm};
  margin-top: ${t('dark').space.sm};
  min-height: 28px;
`;

// === TIMELINE PREVIEW (Signature Element) ===
export const TimelinePreview = styled.div`
  display: flex;
  gap: 2px;
  height: 6px;
  margin: ${t('dark').space.md} 0;
  border-radius: ${t('dark').radius.sm};
  overflow: hidden;
`;

export const TimelineSegment = styled.div<{ $mode: ThemeMode; $status: 'complete' | 'active' | 'planned' | 'overdue' }>`
  flex: 1;
  background: ${p => {
    const colors = t(p.$mode);
    switch (p.$status) {
      case 'complete': return colors.sprintComplete;
      case 'active': return colors.sprintActive;
      case 'overdue': return colors.sprintOverdue;
      case 'planned': return colors.sprintPlanned;
    }
  }};
  opacity: ${p => p.$status === 'planned' ? 0.4 : 1};
`;

// === MINIMAP ===
export const Minimap = styled.div<{ $mode: ThemeMode }>`
  position: relative;
  background: ${p => t(p.$mode).canvas};
  border: 1px solid ${p => t(p.$mode).strokeSubtle};
  border-radius: ${t('dark').radius.md};
  padding: ${t('dark').space.sm};
  margin: ${t('dark').space.md} 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  height: 45px;
  overflow: hidden;
`;

export const MinimapRow = styled.div`
  position: relative;
  height: 5px;
  border-radius: 2px;
`;

export const MinimapPhase = styled.div<{ $mode: ThemeMode; $status: 'complete' | 'active' | 'planned' | 'overdue' }>`
  position: absolute;
  height: 100%;
  border-radius: 2px;
  opacity: ${p => p.$status === 'complete' ? 0.45 : p.$status === 'planned' ? 0.35 : 1};
`;

export const MinimapToday = styled.div<{ $mode: ThemeMode }>`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ef4444;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    width: 6px;
    height: 6px;
    background: #ef4444;
    border-radius: 50%;
  }
`;

export const CardProgress = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkMuted};
  margin-top: ${t('dark').space.sm};
`;

export const ProgressDot = styled.span<{ $mode: ThemeMode; $status: 'complete' | 'active' | 'planned' }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${p => {
    const colors = t(p.$mode);
    switch (p.$status) {
      case 'complete': return colors.sprintComplete;
      case 'active': return colors.sprintActive;
      case 'planned': return colors.sprintPlanned;
    }
  }};
`;

// === MEMBERS ===
export const CardMembers = styled.div`
  display: flex;
  gap: ${t('dark').space.xs};
  align-items: center;
`;

export const MemberOverflow = styled.span<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkFaint};
  margin-left: ${t('dark').space.xs};
`;

// === BADGES ===
export const BadgeGroup = styled.div`
  display: flex;
  gap: ${t('dark').space.xs};
  margin-left: auto;
`;

export const Badge = styled.span<{ $mode: ThemeMode }>`
  display: inline-flex;
  align-items: center;
  gap: ${t('dark').space.xs};
  padding: ${t('dark').space.xs} ${t('dark').space.sm};
  border-radius: ${t('dark').radius.sm};
  font-size: ${t('dark').fontSize.xs};
  background: ${p => t(p.$mode).actionMuted};
  color: ${p => t(p.$mode).action};
`;

// === MENU ===
export const Menu = styled.div`
  position: relative;
`;

export const MenuBtn = styled.button<{ $mode: ThemeMode }>`
  background: none;
  border: none;
  color: ${p => t(p.$mode).inkFaint};
  cursor: pointer;
  padding: ${t('dark').space.xs};
  font-size: 18px;
  border-radius: ${t('dark').radius.sm};
  transition: all ${t('dark').transition.fast};
  
  &:hover {
    color: ${p => t(p.$mode).ink};
    background: ${p => t(p.$mode).panel};
  }
`;

// === FAB ===
export const Fab = styled.button<{ $mode: ThemeMode }>`
  position: fixed;
  bottom: ${t('dark').space.xl};
  right: ${t('dark').space.xl};
  background: ${p => t(p.$mode).action};
  color: white;
  border: none;
  border-radius: ${t('dark').radius.full};
  padding: ${t('dark').space.md} ${t('dark').space.lg};
  font-size: ${t('dark').fontSize.base};
  font-weight: 500;
  cursor: pointer;
  box-shadow: ${t('dark').shadow.lg};
  transition: all ${t('dark').transition.fast};
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  
  &:hover {
    background: ${p => t(p.$mode).actionHover};
    transform: translateY(-2px);
  }
`;

// === FORM ===
export const Input = styled.input<{ $mode: ThemeMode }>`
  width: 100%;
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  background: ${p => t(p.$mode).canvas};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.base};
  margin-bottom: ${t('dark').space.sm};
  transition: border-color ${t('dark').transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${p => t(p.$mode).action};
  }
  
  &::placeholder {
    color: ${p => t(p.$mode).inkFaint};
  }
`;

export const Textarea = styled.textarea<{ $mode: ThemeMode }>`
  width: 100%;
  min-height: 120px;
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  background: ${p => t(p.$mode).canvas};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.base};
  resize: vertical;
  font-family: inherit;
  transition: border-color ${t('dark').transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${p => t(p.$mode).action};
  }
  
  &::placeholder {
    color: ${p => t(p.$mode).inkFaint};
  }
  
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: ${p => t(p.$mode).canvas};
  }
  &::-webkit-scrollbar-thumb {
    background: ${p => t(p.$mode).panel};
    border-radius: 5px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${p => t(p.$mode).action};
  }
`;

// === SKELETON LOADING ===
export const Skeleton = styled.div<{ $mode: ThemeMode }>`
  background: linear-gradient(
    90deg,
    ${p => t(p.$mode).stroke} 25%,
    ${p => t(p.$mode).panel} 50%,
    ${p => t(p.$mode).stroke} 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: ${t('dark').radius.md};
  
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export const SkeletonCard = styled(Skeleton)`
  height: 180px;
`;

// === TABLE VIEW ===
export const Table = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  flex-direction: column;
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.lg};
  overflow: hidden;
`;

export const TableRow = styled.div<{ $mode: ThemeMode; $header?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 300px 200px 40px;
  align-items: center;
  padding: ${p => p.$header ? t('dark').space.sm : t('dark').space.md} ${t('dark').space.lg};
  gap: ${t('dark').space.md};
  border-bottom: 1px solid ${p => t(p.$mode).strokeSubtle};
  background: ${p => p.$header ? t(p.$mode).canvas : 'transparent'};
  cursor: ${p => p.$header ? 'default' : 'pointer'};
  transition: background ${t('dark').transition.fast};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${p => p.$header ? t(p.$mode).canvas : t(p.$mode).panel};
  }
`;

export const TableHeader = styled.span<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkMuted};
  font-size: ${t('dark').fontSize.xs};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const TableCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  min-width: 0;
  width: 100%;
`;

export const TableName = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const TableTitle = styled.span<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).ink};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TableDesc = styled.span<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkMuted};
  font-size: ${t('dark').fontSize.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TableMinimap = styled.div<{ $mode: ThemeMode }>`
  position: relative;
  height: 32px;
  width: 300px;
  background: ${p => t(p.$mode).canvas};
  border: 1px solid ${p => t(p.$mode).strokeSubtle};
  border-radius: ${t('dark').radius.sm};
  overflow: hidden;
`;

export const TableDate = styled.span<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkMuted};
  font-size: ${t('dark').fontSize.sm};
`;

// Export als S für Kompatibilität
export const S = {
  Container, Header, HeaderLeft, Nav, NavItem, Title, SearchBtn, Content,
  Section, SectionHeader, SectionTitle, SectionCount, SectionActions, ViewToggle, ViewToggleBtn,
  Empty, EmptyIcon, EmptyText, Grid,
  CardLink, Card, CardHeader, CardTitle, CardDesc, CardBody, CardMeta, OwnerInfo, CardFooter,
  TimelinePreview, TimelineSegment, Minimap, MinimapRow, MinimapPhase, MinimapToday, CardProgress, ProgressDot,
  CardMembers, MemberOverflow, BadgeGroup, Badge,
  Table, TableRow, TableHeader, TableCell, TableName, TableTitle, TableDesc, TableMinimap, TableDate,
  Menu, MenuBtn,
  Fab, Input, Textarea,
  Skeleton, SkeletonCard,
};
