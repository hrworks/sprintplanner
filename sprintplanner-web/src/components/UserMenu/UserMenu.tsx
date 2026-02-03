import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { S } from './UserMenu.styles';
import { Avatar } from '@/components/Avatar';
import { useStore } from '@/store';

export const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, theme, toggleTheme, logout } = useStore();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <S.StyledWrapper ref={ref}>
      <S.StyledTrigger onClick={() => setOpen(!open)}>
        <Avatar name={user?.name} avatarUrl={user?.avatarUrl} size={36} />
      </S.StyledTrigger>
      <S.StyledDropdown $mode={theme} $visible={open}>
        <S.StyledHeader $mode={theme}>
          <Avatar name={user?.name} avatarUrl={user?.avatarUrl} size={40} />
          <div>
            <S.StyledName $mode={theme}>{user?.name || 'User'}</S.StyledName>
            <S.StyledEmail $mode={theme}>{user?.email}</S.StyledEmail>
          </div>
        </S.StyledHeader>
        <S.StyledItem $mode={theme} as="label">
          <span>🌙 Dark Mode</span>
          <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
        </S.StyledItem>
        <S.StyledDivider $mode={theme} />
        <S.StyledItem $mode={theme} onClick={handleLogout}>Logout</S.StyledItem>
      </S.StyledDropdown>
    </S.StyledWrapper>
  );
};
