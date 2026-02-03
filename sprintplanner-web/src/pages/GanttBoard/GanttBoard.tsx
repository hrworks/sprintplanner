import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { S } from './GanttBoard.styles';
import { Button, Avatar, UserMenu, Modal } from '@/components';
import { useStore } from '@/store';
import { useGanttStore } from './store';
import { api } from '@/api';
import { Sidebar } from './components/Sidebar';
import { GanttChart } from './components/GanttChart';
import { DetailPanel } from './components/DetailPanel';
import { Minimap } from './components/Minimap';
import { ShareModal } from './components/ShareModal';
import { useRealtime } from './hooks/useRealtime';
import { useAutoSave } from './hooks/useAutoSave';

export const GanttBoard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showShare, setShowShare] = useState(false);
  const [showEditBoard, setShowEditBoard] = useState(false);
  const [boardForm, setBoardForm] = useState({ name: '', description: '' });
  
  const {
    boardName, boardRole,
    dayWidth, rowHeight, chartStartDate, chartEndDate,
    showConnections, cursorSettings, activeUsers,
    setBoard, setDayWidth, setRowHeight, setDateRange,
    toggleDetailPanel, toggleConnections, setCursorSettings
  } = useGanttStore();

  // Realtime: SSE for updates, WebSocket for cursors
  useRealtime(id);
  
  // Auto-save changes to backend
  useAutoSave();

  useEffect(() => {
    loadBoard();
  }, [id]);

  const loadBoard = async () => {
    if (!id) {
      navigate('/dashboard');
      return;
    }
    try {
      const board = await api.getBoard(id);
      const boardData = JSON.parse(board.data || '{"projects":[],"connections":[]}');
      setBoard(board.id, board.name, board.role, boardData);
      
      if (boardData.viewStart && boardData.viewEnd) {
        setDateRange(new Date(boardData.viewStart), new Date(boardData.viewEnd));
      }
    } catch {
      navigate('/dashboard');
    }
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const date = new Date(value);
    if (type === 'start') setDateRange(date, chartEndDate);
    else setDateRange(chartStartDate, date);
  };

  const scrollToToday = () => {
    if (!scrollRef.current) return;
    const today = new Date();
    const dayOffset = Math.ceil((today.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const scrollPos = (dayOffset * dayWidth) - (scrollRef.current.clientWidth / 2) + 220;
    scrollRef.current.scrollLeft = Math.max(0, scrollPos);
  };

  const handleCursorSettingChange = (key: 'showMy' | 'showOthers', value: boolean) => {
    setCursorSettings({ ...cursorSettings, [key]: value });
  };

  const openEditBoard = () => {
    setBoardForm({ name: boardName, description: '' });
    setShowEditBoard(true);
  };

  const handleSaveBoard = async () => {
    if (!id) return;
    await api.updateBoard(id, { name: boardForm.name, description: boardForm.description });
    setBoard(id, boardForm.name, boardRole!, useGanttStore.getState().data);
    setShowEditBoard(false);
  };

  return (
    <S.StyledContainer $mode={theme}>
      {/* Top Toolbar */}
      <S.StyledToolbar $mode={theme}>
        <Button $variant="secondary" $size="small" onClick={() => navigate('/dashboard')}>
          ← Zurück
        </Button>
        <S.StyledTitleGroup>
          <S.StyledBoardName>{boardName}</S.StyledBoardName>
          {boardRole !== 'viewer' && (
            <S.StyledIconBtn $mode={theme} title="Board bearbeiten" onClick={openEditBoard}>✏️</S.StyledIconBtn>
          )}
        </S.StyledTitleGroup>
        <S.StyledCursorSettings $mode={theme}>
          <label title="Meinen Cursor anderen zeigen">
            <input type="checkbox" checked={cursorSettings.showMy} onChange={e => handleCursorSettingChange('showMy', e.target.checked)} /> 📤
          </label>
          <label title="Cursor anderer anzeigen">
            <input type="checkbox" checked={cursorSettings.showOthers} onChange={e => handleCursorSettingChange('showOthers', e.target.checked)} /> 👁️
          </label>
        </S.StyledCursorSettings>
        <S.StyledActiveUsers>
          {activeUsers.slice(0, 5).map((u, i) => (
            <Avatar key={`${u.id}-${i}`} name={u.name} avatarUrl={u.avatar} size={28} />
          ))}
          {activeUsers.length > 5 && <span style={{ fontSize: 11, color: '#888' }}>+{activeUsers.length - 5}</span>}
        </S.StyledActiveUsers>
        {boardRole === 'owner' && (
          <Button $size="small" onClick={() => setShowShare(true)}>Teilen</Button>
        )}
        <UserMenu />
      </S.StyledToolbar>

      <S.StyledMainContainer>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <S.StyledMainContent>
          {/* Chart Toolbar */}
          <S.StyledChartToolbar $mode={theme}>
            <S.StyledToolbarLeft>
              <S.StyledToolbarGroup $mode={theme}>
                <label>Von:</label>
                <S.StyledDateInput $mode={theme} type="date" value={formatDate(chartStartDate)} onChange={e => handleDateChange('start', e.target.value)} />
                <label>Bis:</label>
                <S.StyledDateInput $mode={theme} type="date" value={formatDate(chartEndDate)} onChange={e => handleDateChange('end', e.target.value)} />
              </S.StyledToolbarGroup>
              <S.StyledToolbarGroup $mode={theme}>
                <label>Zoom:</label>
                <S.StyledSlider type="range" min={2} max={60} value={dayWidth} onChange={e => setDayWidth(Number(e.target.value))} />
                <span style={{ fontSize: 11, color: '#888', width: 35 }}>{dayWidth}px</span>
              </S.StyledToolbarGroup>
              <S.StyledToolbarGroup $mode={theme}>
                <label>Höhe:</label>
                <S.StyledSlider type="range" min={45} max={135} value={rowHeight} onChange={e => setRowHeight(Number(e.target.value))} />
                <span style={{ fontSize: 11, color: '#888', width: 35 }}>{rowHeight}px</span>
              </S.StyledToolbarGroup>
              <S.StyledToolbarGroup $mode={theme}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input type="checkbox" checked={showConnections} onChange={toggleConnections} />
                  Verbindungen
                </label>
              </S.StyledToolbarGroup>
              <S.StyledNavButtons>
                <S.StyledNavBtn $mode={theme} onClick={scrollToToday}>📍 Heute</S.StyledNavBtn>
                <S.StyledNavBtn $mode={theme} onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}>◀</S.StyledNavBtn>
                <S.StyledNavBtn $mode={theme} onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}>▶</S.StyledNavBtn>
              </S.StyledNavButtons>
            </S.StyledToolbarLeft>
            <Button $variant="secondary" $size="small" onClick={toggleDetailPanel}>Details ☰</Button>
          </S.StyledChartToolbar>

          {/* Gantt Chart */}
          <S.StyledGanttOuter>
            <GanttChart scrollRef={scrollRef} />
            <Minimap scrollRef={scrollRef} />
          </S.StyledGanttOuter>
        </S.StyledMainContent>

        {/* Detail Panel */}
        <DetailPanel />
      </S.StyledMainContainer>

      {showShare && id && <ShareModal boardId={id} onClose={() => setShowShare(false)} />}
      
      {showEditBoard && (
        <Modal title="Board bearbeiten" onClose={() => setShowEditBoard(false)} footer={
          <>
            <Button $variant="secondary" onClick={() => setShowEditBoard(false)}>Abbrechen</Button>
            <Button onClick={handleSaveBoard}>Speichern</Button>
          </>
        }>
          <S.StyledFormGroup>
            <S.StyledLabel $mode={theme}>Name</S.StyledLabel>
            <S.StyledInput $mode={theme} value={boardForm.name} onChange={e => setBoardForm({ ...boardForm, name: e.target.value })} autoFocus />
          </S.StyledFormGroup>
          <S.StyledFormGroup>
            <S.StyledLabel $mode={theme}>Beschreibung</S.StyledLabel>
            <S.StyledTextarea $mode={theme} value={boardForm.description} onChange={e => setBoardForm({ ...boardForm, description: e.target.value })} rows={3} />
          </S.StyledFormGroup>
        </Modal>
      )}
    </S.StyledContainer>
  );
};
