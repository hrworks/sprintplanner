import styled from '@emotion/styled';
import { getColors } from '@/styles';
import { ThemeMode } from '@/styles';

export const StyledContainer = styled.div<{ $mode: ThemeMode }>`
  min-height: 100vh;
  background: ${p => getColors(p.$mode).bgPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledCard = styled.div<{ $mode: ThemeMode }>`
  background: ${p => getColors(p.$mode).bgSecondary};
  border: 1px solid ${p => getColors(p.$mode).border};
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  min-width: 320px;
`;

export const StyledTitle = styled.h1<{ $mode: ThemeMode }>`
  color: ${p => getColors(p.$mode).accent};
  margin-bottom: 8px;
  font-size: 2em;
`;

export const StyledSubtitle = styled.p<{ $mode: ThemeMode }>`
  color: ${p => getColors(p.$mode).textSecondary};
  margin-bottom: 30px;
`;

export const StyledButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const StyledGoogleBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  background: white;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background: #f5f5f5;
  }
`;

export const StyledDevBtn = styled.button<{ $mode: ThemeMode }>`
  padding: 12px 24px;
  background: ${p => getColors(p.$mode).bgTertiary};
  color: ${p => getColors(p.$mode).textSecondary};
  border: 1px solid ${p => getColors(p.$mode).border};
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    color: ${p => getColors(p.$mode).textPrimary};
  }
`;

export const S = { StyledContainer, StyledCard, StyledTitle, StyledSubtitle, StyledButtons, StyledGoogleBtn, StyledDevBtn };
