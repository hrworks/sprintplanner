import { useEffect, useRef } from 'react';
import { useGanttStore } from '../store';
import { api } from '@/api';

export const useAutoSave = () => {
  const { boardId, boardRole, data, chartStartDate, chartEndDate } = useGanttStore();
  const lastSavedRef = useRef<string>('');
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (!boardId || boardRole === 'viewer') return;

    const dataStr = JSON.stringify({ ...data, viewStart: chartStartDate.toISOString().split('T')[0], viewEnd: chartEndDate.toISOString().split('T')[0] });
    
    if (dataStr === lastSavedRef.current) return;

    // Debounce save by 500ms
    clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      lastSavedRef.current = dataStr;
      api.updateBoard(boardId, { data: dataStr }).catch(e => console.error('Save failed:', e));
    }, 500);

    return () => clearTimeout(timeoutRef.current);
  }, [boardId, boardRole, data, chartStartDate, chartEndDate]);
};
