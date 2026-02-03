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

export const StyledHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
`;

export const StyledNav = styled.nav`
  display: flex;
  gap: 24px;
`;

export const StyledNavItem = styled.span<{ $mode: ThemeMode; $active?: boolean }>`
  color: ${p => p.$active ? getColors(p.$mode).textPrimary : getColors(p.$mode).textSecondary};
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: ${p => getColors(p.$mode).textPrimary};
  }
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

export const StyledSectionTitle = styled.h2<{ $mode: ThemeMode }>`
  color: ${p => getColors(p.$mode).textSecondary};
  font-size: 14px;
  text-transform: uppercase;
  margin-bottom: 16px;
`;

export const StyledEmpty = styled.div<{ $mode: ThemeMode }>`
  color: ${p => getColors(p.$mode).textSecondary};
  padding: 20px;
  text-align: center;
`;

export const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

export const StyledCard = styled.div<{ $mode: ThemeMode }>`
  background: ${p => getColors(p.$mode).bgSecondary};
  border: 1px solid ${p => getColors(p.$mode).border};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

export const StyledCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

export const StyledCardTitle = styled.h3<{ $mode: ThemeMode }>`
  color: ${p => getColors(p.$mode).textPrimary};
  font-size: 1.1em;
`;

export const StyledCardDesc = styled.p<{ $mode: ThemeMode }>`
  color: ${p => getColors(p.$mode).textSecondary};
  font-size: 13px;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const StyledCardMeta = styled.div<{ $mode: ThemeMode }>`
  color: ${p => getColors(p.$mode).textSecondary};
  font-size: 12px;
`;

export const StyledCardMembers = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 12px;
  align-items: center;
`;

export const StyledMenu = styled.div`
  position: relative;
`;

export const StyledMenuBtn = styled.button<{ $mode: ThemeMode }>`
  background: none;
  border: none;
  color: ${p => getColors(p.$mode).textSecondary};
  cursor: pointer;
  padding: 4px 8px;
  font-size: 18px;
  
  &:hover {
    color: ${p => getColors(p.$mode).textPrimary};
  }
`;

export const StyledMenuDropdown = styled.div<{ $mode: ThemeMode; $visible: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${p => getColors(p.$mode).bgTertiary};
  border: 1px solid ${p => getColors(p.$mode).border};
  border-radius: 6px;
  min-width: 120px;
  display: ${p => p.$visible ? 'block' : 'none'};
  z-index: 10;
`;

export const StyledMenuItem = styled.button<{ $mode: ThemeMode }>`
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: ${p => getColors(p.$mode).textPrimary};
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  
  &:hover {
    background: ${p => getColors(p.$mode).bgSecondary};
  }
`;

export const StyledFab = styled.button<{ $mode: ThemeMode }>`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: ${p => getColors(p.$mode).accent};
  color: white;
  border: none;
  border-radius: 30px;
  padding: 15px 25px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.4);
  
  &:hover {
    opacity: 0.9;
  }
`;

export const StyledInput = styled.input<{ $mode: ThemeMode }>`
  width: 100%;
  padding: 10px;
  background: ${p => getColors(p.$mode).bgPrimary};
  border: 1px solid ${p => getColors(p.$mode).border};
  border-radius: 6px;
  color: ${p => getColors(p.$mode).textPrimary};
  font-size: 14px;
  margin-bottom: 10px;
`;

export const StyledTextarea = styled.textarea<{ $mode: ThemeMode }>`
  width: 100%;
  padding: 10px;
  background: ${p => getColors(p.$mode).bgPrimary};
  border: 1px solid ${p => getColors(p.$mode).border};
  border-radius: 6px;
  color: ${p => getColors(p.$mode).textPrimary};
  font-size: 14px;
  resize: vertical;
`;

export const S = {
  StyledContainer, StyledHeader, StyledHeaderLeft, StyledNav, StyledNavItem, StyledTitle, StyledContent,
  StyledSection, StyledSectionTitle, StyledEmpty, StyledGrid,
  StyledCard, StyledCardHeader, StyledCardTitle, StyledCardDesc, StyledCardMeta, StyledCardMembers,
  StyledMenu, StyledMenuBtn, StyledMenuDropdown, StyledMenuItem,
  StyledFab, StyledInput, StyledTextarea
};
