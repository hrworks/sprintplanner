import styled from '@emotion/styled';
import { getColors } from '@/styles';
import { ThemeMode } from '@/styles';

export const StyledButton = styled.button<{ 
  $variant?: 'primary' | 'secondary' | 'danger';
  $size?: 'small' | 'medium';
  $mode: ThemeMode;
}>`
  padding: ${p => p.$size === 'small' ? '6px 12px' : '10px 20px'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: ${p => p.$size === 'small' ? '12px' : '14px'};
  transition: opacity 0.2s;
  
  ${p => {
    const colors = getColors(p.$mode);
    switch (p.$variant) {
      case 'danger':
        return `background: ${colors.danger}; color: white;`;
      case 'secondary':
        return `background: ${colors.bgTertiary}; color: ${colors.textPrimary};`;
      default:
        return `background: ${colors.accent}; color: white;`;
    }
  }}
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const S = { StyledButton };
