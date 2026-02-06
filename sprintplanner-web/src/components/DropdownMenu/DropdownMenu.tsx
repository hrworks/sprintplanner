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

interface DividerItem {
  type: 'divider';
  label?: string;
}

type Item = MenuItem | DividerItem;

interface Props {
  items: Item[];
  onClose: () => void;
  align?: 'left' | 'right';
  minWidth?: number;
}

export const DropdownMenu = ({ items, onClose, align = 'right', minWidth }: Props) => {
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
    <Menu ref={ref} $mode={theme} $align={align} $minWidth={minWidth}>
      {items.map((item, i) => 
        'type' in item && item.type === 'divider' ? (
          <Divider key={i} $mode={theme}>
            {item.label && <DividerLabel>{item.label}</DividerLabel>}
          </Divider>
        ) : (
          <ItemBtn key={i} $mode={theme} $danger={(item as MenuItem).danger} onClick={() => { (item as MenuItem).onClick(); onClose(); }}>
            {(item as MenuItem).icon && <Icon>{(item as MenuItem).icon}</Icon>}
            {(item as MenuItem).label}
          </ItemBtn>
        )
      )}
    </Menu>
  );
};

const Menu = styled.div<{ $mode: ThemeMode; $align: 'left' | 'right'; $minWidth?: number }>`
  position: absolute;
  top: 100%;
  ${p => p.$align}: 0;
  margin-top: ${t('dark').space.xs};
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  min-width: ${p => p.$minWidth ? `${p.$minWidth}px` : '160px'};
  box-shadow: ${t('dark').shadow.lg};
  z-index: 100;
  overflow: hidden;
`;

const Divider = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  gap: ${t('dark').space.sm};
`;

const DividerLabel = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  color: ${t('dark').inkFaint};
  white-space: nowrap;
  
  &::after {
    content: '';
    display: inline-block;
    width: 100%;
    height: 1px;
    background: ${t('dark').stroke};
    margin-left: ${t('dark').space.sm};
    vertical-align: middle;
  }
`;

const ItemBtn = styled.button<{ $mode: ThemeMode; $danger?: boolean }>`
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
