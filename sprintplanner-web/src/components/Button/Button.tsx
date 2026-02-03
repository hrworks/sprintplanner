import { S } from './Button.styles';
import { ButtonProps } from './Button.types';
import { useStore } from '@/store';

export const Button = ({ $variant = 'primary', $size = 'medium', ...props }: ButtonProps) => {
  const theme = useStore((s) => s.theme);
  return <S.StyledButton $variant={$variant} $size={$size} $mode={theme} {...props} />;
};
