import styled from '@emotion/styled';
import { t, ThemeMode } from '@/styles';

export const StyledButton = styled.button<{ 
  $variant?: 'primary' | 'secondary' | 'danger';
  $size?: 'small' | 'medium';
  $mode: ThemeMode;
}>`
  padding: ${p => p.$size === 'small' ? `${t('dark').space.xs} ${t('dark').space.sm}` : `${t('dark').space.sm} ${t('dark').space.lg}`};
  border: none;
  border-radius: ${t('dark').radius.md};
  cursor: pointer;
  font-size: ${p => p.$size === 'small' ? t('dark').fontSize.xs : t('dark').fontSize.base};
  font-weight: 500;
  transition: all ${t('dark').transition.fast};
  
  ${p => {
    const colors = t(p.$mode);
    switch (p.$variant) {
      case 'danger':
        return `
          background: ${colors.danger};
          color: white;
          &:hover:not(:disabled) { background: ${colors.danger}; opacity: 0.9; }
        `;
      case 'secondary':
        return `
          background: ${colors.panel};
          color: ${colors.ink};
          border: 1px solid ${colors.stroke};
          &:hover:not(:disabled) { background: ${colors.actionMuted}; border-color: ${colors.action}; }
        `;
      default:
        return `
          background: ${colors.action};
          color: white;
          &:hover:not(:disabled) { background: ${colors.actionHover}; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const S = { StyledButton };
