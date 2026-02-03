import { useEffect, useRef } from 'react';
import { useGanttStore } from '../store';
import { auth } from '@/api';

const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:3001`;

export const useRealtime = (boardId: string | undefined) => {
  const sseRef = useRef<EventSource | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const instanceIdRef = useRef<string | null>(null);

  // SSE for board updates
  useEffect(() => {
    if (!boardId) return;
    const token = auth.getToken();
    if (!token) return;

    const sse = new EventSource(`/api/boards/${boardId}/stream?token=${token}`);
    sse.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.event === 'update' && msg.data?.data) {
        const { boardName, boardRole, setBoard } = useGanttStore.getState();
        const boardData = JSON.parse(msg.data.data);
        setBoard(boardId, boardName, boardRole || 'viewer', boardData);
      }
    };
    sseRef.current = sse;

    return () => sse.close();
  }, [boardId]);

  // WebSocket for cursors
  useEffect(() => {
    if (!boardId) return;
    const token = auth.getToken();
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    ws.onopen = () => ws.send(JSON.stringify({ type: 'join', boardId }));
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      const { cursorSettings, setActiveUsers } = useGanttStore.getState();
      
      if (msg.type === 'connected') {
        instanceIdRef.current = msg.instanceId;
      } else if (msg.type === 'cursor' && cursorSettings.showOthers) {
        updateRemoteCursor(msg.instanceId, msg.name, msg.color, msg.x, msg.y);
      } else if (msg.type === 'cursor_leave') {
        removeRemoteCursor(msg.instanceId);
      } else if (msg.type === 'users') {
        setActiveUsers(msg.users);
      }
    };
    wsRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      remoteCursors.forEach(c => c.remove());
      remoteCursors.clear();
    };
  }, [boardId]);

  // Send cursor position (normalized for zoom/height)
  useEffect(() => {
    let lastSent = 0;
    let wasInside = false;
    const BASE_DAY_WIDTH = 10;
    const BASE_ROW_HEIGHT = 100;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { cursorSettings, dayWidth, rowHeight } = useGanttStore.getState();
      if (!cursorSettings.showMy) return;
      
      const ganttBody = document.querySelector('.gantt-body');
      if (!ganttBody) return;
      const rect = ganttBody.getBoundingClientRect();
      const isInside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      
      // Send leave event when cursor exits gantt chart
      if (wasInside && !isInside) {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'leave' }));
        }
      }
      wasInside = isInside;
      
      if (!isInside) return;
      
      const now = Date.now();
      if (now - lastSent < 50) return;
      lastSent = now;
      
      // Normalize position relative to gantt body and zoom/height
      const relX = (e.clientX - rect.left) * (BASE_DAY_WIDTH / dayWidth);
      const relY = (e.clientY - rect.top) * (BASE_ROW_HEIGHT / rowHeight);
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'cursor', x: relX, y: relY }));
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
};

const remoteCursors = new Map<string, HTMLDivElement>();
const BASE_DAY_WIDTH = 10;
const BASE_ROW_HEIGHT = 100;

function updateRemoteCursor(instanceId: string, name: string, color: string, x: number, y: number) {
  const ganttBody = document.querySelector('.gantt-body');
  if (!ganttBody) return;
  
  const { dayWidth, rowHeight } = useGanttStore.getState();
  const rect = ganttBody.getBoundingClientRect();
  
  // Denormalize position
  const screenX = rect.left + x * (dayWidth / BASE_DAY_WIDTH);
  const screenY = rect.top + y * (rowHeight / BASE_ROW_HEIGHT);
  
  let cursor = remoteCursors.get(instanceId);
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'remote-cursor';
    cursor.innerHTML = `
      <svg viewBox="0 0 24 24" fill="${color}" width="20" height="20">
        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L5.94 2.35a.5.5 0 0 0-.44.86z"/>
      </svg>
      <span style="position:absolute;left:16px;top:16px;padding:2px 6px;border-radius:4px;font-size:11px;background:${color};color:white;white-space:nowrap;">${name}</span>
    `;
    cursor.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;transition:all 0.1s ease-out;';
    document.body.appendChild(cursor);
    remoteCursors.set(instanceId, cursor);
  }
  cursor.style.left = screenX + 'px';
  cursor.style.top = screenY + 'px';
}

function removeRemoteCursor(instanceId: string) {
  const cursor = remoteCursors.get(instanceId);
  if (cursor) {
    cursor.remove();
    remoteCursors.delete(instanceId);
  }
}
