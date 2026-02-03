import { S } from './Avatar.styles';
import { AvatarProps } from './Avatar.types';

const COLORS = ['#e94560', '#4ade80', '#fbbf24', '#60a5fa', '#a78bfa', '#f472b6', '#34d399', '#fb923c'];

const getColor = (name?: string) => {
  if (!name) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
};

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

export const Avatar = ({ name, avatarUrl, size = 32 }: AvatarProps) => {
  const color = getColor(name);
  
  return (
    <S.StyledAvatar $size={size} $color={color}>
      {avatarUrl ? <img src={avatarUrl} alt={name} /> : getInitials(name)}
    </S.StyledAvatar>
  );
};
