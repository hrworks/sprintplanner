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
      console.log('Flushing actions:', actions.length, actions.map(a => a.type));
      actions.forEach(action => {
        api.sendAction(boardId, action, clientId)
          .then(() => console.log('Action sent:', action.type))
          .catch(e => console.error('Action failed:', action.type, e));
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
      // Flush remaining actions synchronously on unmount
      if (actionQueue.length > 0) {
        const actions = actionQueue.splice(0, actionQueue.length);
        actions.forEach(action => {
          api.sendAction(boardId, action, clientId).catch(e => console.error('Action failed:', e));
        });
      }
    };
  }, [boardId, boardRole]);
};
