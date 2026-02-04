import { useEffect, useRef } from 'react';
import { useGanttStore, actionQueue, clientId } from '../store';
import { api } from '@/api';

export const useAutoSave = () => {
  const { boardId, boardRole } = useGanttStore();
  const pendingRef = useRef(false);

  useEffect(() => {
    if (!boardId || boardRole === 'viewer') return;

    const flush = () => {
      pendingRef.current = false;
      if (actionQueue.length === 0) return;
      
      const actions = actionQueue.splice(0, actionQueue.length);
      // console.log('Flushing actions:', actions);
      actions.forEach(action => {
        api.sendAction(boardId, action, clientId).catch(e => console.error('Action failed:', e));
      });
    };

    const interval = setInterval(() => {
      if (actionQueue.length > 0 && !pendingRef.current) {
        pendingRef.current = true;
        setTimeout(flush, 100);
      }
    }, 50);

    return () => {
      clearInterval(interval);
      flush();
    };
  }, [boardId, boardRole]);
};
