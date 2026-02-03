import styled from '@emotion/styled';
import { RefObject, useEffect, useState, useRef } from 'react';
import { useStore } from '@/store';
import { useGanttStore } from '../store';
import { getColors } from '@/styles';

const StyledMinimap = styled.div<{ $mode: string }>`
  height: 40px;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary};
  border-top: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').bgPrimary};
  position: relative;
  cursor: pointer;
`;

const StyledViewport = styled.div<{ $left: number; $width: number }>`
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: ${p => p.$left}px;
  width: ${p => Math.max(30, p.$width)}px;
  background: rgba(233, 69, 96, 0.3);
  border: 1px solid #e94560;
  border-radius: 3px;
  cursor: grab;
  &:active { cursor: grabbing; }
`;

const StyledBar = styled.div<{ $left: number; $width: number; $top: number; $color: string }>`
  position: absolute;
  left: ${p => p.$left}px;
  width: ${p => Math.max(2, p.$width)}px;
  top: ${p => p.$top}px;
  height: 4px;
  border-radius: 2px;
  background: ${p => p.$color};
`;

interface MinimapProps {
  scrollRef: RefObject<HTMLDivElement>;
}

export const Minimap = ({ scrollRef }: MinimapProps) => {
  const { theme } = useStore();
  const { data, dayWidth, chartStartDate, chartEndDate } = useGanttStore();
  const [viewport, setViewport] = useState({ left: 0, width: 100 });
  const [minimapWidth, setMinimapWidth] = useState(0);
  const dragState = useRef<{ startX: number; startScrollLeft: number } | null>(null);

  const totalDays = Math.ceil((chartEndDate.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  useEffect(() => {
    const updateViewport = () => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const scrollWidth = container.scrollWidth - 220;
      const clientWidth = container.clientWidth - 220;
      const scrollLeft = container.scrollLeft;
      const width = (clientWidth / scrollWidth) * minimapWidth;
      const left = (scrollLeft / scrollWidth) * minimapWidth;
      setViewport({ left: Math.max(0, left), width });
    };

    const handleResize = () => {
      const el = scrollRef.current?.parentElement?.querySelector('.minimap');
      if (el) setMinimapWidth(el.clientWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    scrollRef.current?.addEventListener('scroll', updateViewport);
    updateViewport();

    return () => {
      window.removeEventListener('resize', handleResize);
      scrollRef.current?.removeEventListener('scroll', updateViewport);
    };
  }, [scrollRef, minimapWidth, dayWidth]);

  const handleMinimapClick = (e: React.MouseEvent) => {
    if (dragState.current) return;
    if (!scrollRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = clickX / minimapWidth;
    const scrollWidth = scrollRef.current.scrollWidth - 220;
    const clientWidth = scrollRef.current.clientWidth - 220;
    scrollRef.current.scrollLeft = (ratio * scrollWidth) - (clientWidth / 2);
  };

  const handleViewportMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!scrollRef.current) return;
    
    dragState.current = {
      startX: e.clientX,
      startScrollLeft: scrollRef.current.scrollLeft
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.current || !scrollRef.current) return;
      const deltaX = e.clientX - dragState.current.startX;
      const scrollWidth = scrollRef.current.scrollWidth - 220;
      const scrollDelta = (deltaX / minimapWidth) * scrollWidth;
      scrollRef.current.scrollLeft = dragState.current.startScrollLeft + scrollDelta;
    };
    
    const handleMouseUp = () => {
      dragState.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const scale = minimapWidth / totalDays;
  const rowHeightMini = 36 / Math.max(data.projects.length, 1);

  return (
    <StyledMinimap className="minimap" $mode={theme} onClick={handleMinimapClick}>
      {data.projects.map((project, idx) =>
        project.phases.map(phase => {
          const phaseStart = new Date(phase.start + 'T00:00:00');
          const phaseEnd = new Date(phase.end + 'T00:00:00');
          if (phaseEnd < chartStartDate || phaseStart > chartEndDate) return null;
          
          const leftDays = Math.max(0, Math.ceil((phaseStart.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24)));
          const durationDays = Math.ceil((phaseEnd.getTime() - phaseStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          return (
            <StyledBar
              key={phase._id}
              $left={leftDays * scale}
              $width={durationDays * scale}
              $top={2 + idx * rowHeightMini}
              $color={phase.color}
            />
          );
        })
      )}
      <StyledViewport 
        $left={viewport.left} 
        $width={viewport.width} 
        onMouseDown={handleViewportMouseDown}
      />
    </StyledMinimap>
  );
};
