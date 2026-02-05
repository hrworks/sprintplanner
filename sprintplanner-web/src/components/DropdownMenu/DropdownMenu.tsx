import { ReactNode, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { t, ThemeMode } from '@/styles';
import { useStore } from '@/store';

interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface Props {
  items: MenuItem[];
  onClose: () => void;
  align?: 'left' | 'right';
}

export const DropdownMenu = ({ items, onClose, align = 'right' }: Props) => {
  const { theme } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <Menu ref={ref} $mode={theme} $align={align}>
      {items.map((item, i) => (
        <Item key={i} $mode={theme} $danger={item.danger} onClick={() => { item.onClick(); onClose(); }}>
          {item.icon && <Icon>{item.icon}</Icon>}
          {item.label}
        </Item>
      ))}
    </Menu>
  );
};

const Menu = styled.div<{ $mode: ThemeMode; $align: 'left' | 'right' }>`
  position: absolute;
  top: 100%;
  ${p => p.$align}: 0;
  margin-top: ${t('dark').space.xs};
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  min-width: 160px;
  box-shadow: ${t('dark').shadow.lg};
  z-index: 100;
  overflow: hidden;
`;

const Item = styled.button<{ $mode: ThemeMode; $danger?: boolean }>`
  width: 100%;
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  background: none;
  border: none;
  color: ${p => p.$danger ? t(p.$mode).danger : t(p.$mode).ink};
  cursor: pointer;
  text-align: left;
  font-size: ${t('dark').fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  transition: background ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => p.$danger ? t(p.$mode).dangerMuted : t(p.$mode).actionMuted};
  }
`;

const Icon = styled.span`
  display: flex;
  align-items: center;
  font-size: 16px;
`;
