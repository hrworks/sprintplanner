import styled from '@emotion/styled';
import { getColors } from '@/styles';
import { ThemeMode } from '@/styles';

export const StyledContainer = styled.div<{ $mode: ThemeMode }>`
  min-height: 100vh;
  background: ${p => getColors(p.$mode).bgPrimary};
`;

export const StyledHeader = styled.header<{ $mode: ThemeMode }>`
  background: ${p => getColors(p.$mode).bgSecondary};
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${p => getColors(p.$mode).border};
`;

export const StyledTitle = styled.h1<{ $mode: ThemeMode }>`
  color: ${p => getColors(p.$mode).accent};
  font-size: 1.5em;
`;

export const StyledContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const StyledSection = styled.section`
  margin-bottom: 40px;
`;

export const StyledSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const StyledSectionTitle = styled.h2<{ $mode: ThemeMode }>`
  color: ${p => getColors(p.$mode).textSecondary};
  font-size: 14px;
  text-transform: uppercase;
`;

export const StyledTable = styled.div<{ $mode: ThemeMode }>`
  background: ${p => getColors(p.$mode).bgSecondary};
  border: 1px solid ${p => getColors(p.$mode).border};
  border-radius: 8px;
  overflow: hidden;
`;

export const StyledRow = styled.div<{ $mode: ThemeMode }>`
  display: grid;
  grid-template-columns: auto 1fr auto auto auto auto;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid ${p => getColors(p.$mode).border};
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${p => getColors(p.$mode).bgTertiary};
  }
`;

export const StyledBoardStats = styled.span<{ $mode: ThemeMode }>`
  font-size: 12px;
  color: ${p => getColors(p.$mode).textSecondary};
`;

export const StyledUserInfo = styled.div``;

export const StyledUserName = styled.div<{ $mode: ThemeMode }>`
  font-weight: 500;
  color: ${p => getColors(p.$mode).textPrimary};
`;

export const StyledUserEmail = styled.div<{ $mode: ThemeMode }>`
  font-size: 12px;
  color: ${p => getColors(p.$mode).textSecondary};
`;

export const StyledStatus = styled.span<{ $mode: ThemeMode; $status: 'active' | 'pending' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${p => p.$status === 'active' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)'};
  color: ${p => p.$status === 'active' ? '#4ade80' : '#fbbf24'};
`;

export const StyledSelect = styled.select<{ $mode: ThemeMode }>`
  padding: 4px 8px;
  border-radius: 4px;
  background: ${p => getColors(p.$mode).bgTertiary};
  color: ${p => getColors(p.$mode).textPrimary};
  border: 1px solid ${p => getColors(p.$mode).border};
  font-size: 12px;
`;

export const StyledRoleLabel = styled.span<{ $mode: ThemeMode }>`
  font-size: 12px;
  color: ${p => getColors(p.$mode).textSecondary};
`;

export const StyledInput = styled.input<{ $mode: ThemeMode }>`
  width: 100%;
  padding: 10px;
  background: ${p => getColors(p.$mode).bgPrimary};
  border: 1px solid ${p => getColors(p.$mode).border};
  border-radius: 6px;
  color: ${p => getColors(p.$mode).textPrimary};
  font-size: 14px;
`;

export const StyledEmpty = styled.div<{ $mode: ThemeMode }>`
  color: ${p => getColors(p.$mode).textSecondary};
  padding: 20px;
  text-align: center;
`;

export const S = {
  StyledContainer, StyledHeader, StyledTitle, StyledContent,
  StyledSection, StyledSectionHeader, StyledSectionTitle,
  StyledTable, StyledRow, StyledUserInfo, StyledUserName, StyledUserEmail,
  StyledStatus, StyledSelect, StyledRoleLabel, StyledInput, StyledEmpty, StyledBoardStats
};
