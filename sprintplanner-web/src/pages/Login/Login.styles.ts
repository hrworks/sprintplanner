import styled from '@emotion/styled';
import { t, ThemeMode } from '@/styles';

export const Container = styled.div<{ $mode: ThemeMode }>`
  min-height: 100vh;
  background: ${p => t(p.$mode).canvas};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.md};
  margin-bottom: ${t('dark').space.lg};
`;

export const Logo = styled.img`
  width: 40px;
  height: 40px;
`;

export const BrandName = styled.span<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).ink};
  font-size: 2.25rem;
  font-weight: 600;
`;

export const Card = styled.div<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.lg};
  padding: ${t('dark').space.xxl};
  text-align: center;
  min-width: 360px;
  box-shadow: ${t('dark').shadow.lg};
`;

export const Title = styled.h1<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).ink};
  margin: 0 0 ${t('dark').space.xs};
  font-size: ${t('dark').fontSize.lg};
  font-weight: 600;
`;

export const Subtitle = styled.p<{ $mode: ThemeMode }>`
  color: ${p => t(p.$mode).inkMuted};
  margin: 0 0 ${t('dark').space.lg};
  font-size: ${t('dark').fontSize.sm};
`;

export const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${t('dark').space.sm};
`;

export const GoogleBtn = styled.button<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${t('dark').space.sm};
  padding: ${t('dark').space.md};
  background: ${p => t(p.$mode).panel};
  color: ${p => t(p.$mode).ink};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  font-size: ${t('dark').fontSize.base};
  cursor: pointer;
  transition: all ${t('dark').transition.fast};
  
  &:hover {
    border-color: ${p => t(p.$mode).action};
    background: ${p => t(p.$mode).actionMuted};
  }
`;

export const DevBtn = styled.button<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.md};
  background: transparent;
  color: ${p => t(p.$mode).inkMuted};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  font-size: ${t('dark').fontSize.sm};
  cursor: pointer;
  transition: all ${t('dark').transition.fast};
  
  &:hover {
    color: ${p => t(p.$mode).ink};
    border-color: ${p => t(p.$mode).inkMuted};
  }
`;

export const S = { 
  StyledContainer: Container,
  StyledWrapper: Wrapper,
  StyledBrand: Brand,
  StyledLogo: Logo,
  StyledBrandName: BrandName,
  StyledCard: Card, 
  StyledTitle: Title, 
  StyledSubtitle: Subtitle, 
  StyledButtons: Buttons, 
  StyledGoogleBtn: GoogleBtn, 
  StyledDevBtn: DevBtn 
};
