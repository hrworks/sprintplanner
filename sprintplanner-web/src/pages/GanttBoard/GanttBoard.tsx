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
    boardName, boardRole, selectedPhaseId,
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
        // Use internal setter to avoid sending action on load
        useGanttStore.setState({ 
          chartStartDate: new Date(boardData.viewStart), 
          chartEndDate: new Date(boardData.viewEnd) 
        });
      } else {
        // Reset to current year for new boards (also don't send action)
        const year = new Date().getFullYear();
        useGanttStore.setState({ 
          chartStartDate: new Date(year, 0, 1), 
          chartEndDate: new Date(year, 11, 31) 
        });
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
        <S.StyledBackBtn $mode={theme} onClick={() => navigate('/dashboard')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </S.StyledBackBtn>
        <S.StyledTitleGroup>
          <S.StyledBoardName>{boardName}</S.StyledBoardName>
          {boardRole !== 'viewer' && (
            <S.StyledIconBtn $mode={theme} title="Board bearbeiten" onClick={openEditBoard}>✏️</S.StyledIconBtn>
          )}
        </S.StyledTitleGroup>
        <S.StyledToolbarRight>
          <S.StyledCursorDropdown $mode={theme}>
            <S.StyledCursorDropdownBtn $mode={theme}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginTop: 2 }}>
                <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L5.94 2.35a.5.5 0 0 0-.44.86z"/>
              </svg>
              ▾
            </S.StyledCursorDropdownBtn>
            <S.StyledCursorDropdownMenu $mode={theme}>
              <S.StyledCursorDropdownItem $mode={theme} onClick={() => handleCursorSettingChange('showOthers', !cursorSettings.showOthers)}>
                {cursorSettings.showOthers && '✓'} Cursor von Mitbearbeitern anzeigen
              </S.StyledCursorDropdownItem>
              <S.StyledCursorDropdownItem $mode={theme} onClick={() => handleCursorSettingChange('showMy', !cursorSettings.showMy)}>
                {cursorSettings.showMy && '✓'} Meinen Cursor anzeigen
              </S.StyledCursorDropdownItem>
            </S.StyledCursorDropdownMenu>
          </S.StyledCursorDropdown>
          <S.StyledActiveUsers>
            {activeUsers.slice(0, 5).map((u, i) => (
              <Avatar key={`${u.id}-${i}`} name={u.name} avatarUrl={u.avatar} size={28} />
            ))}
            {activeUsers.length > 5 && <span style={{ fontSize: 11, color: '#888' }}>+{activeUsers.length - 5}</span>}
          </S.StyledActiveUsers>
          {boardRole === 'owner' && (
            <Button $size="small" onClick={() => setShowShare(true)}>Teilen</Button>
          )}
        </S.StyledToolbarRight>
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
                <S.StyledNavBtn $mode={theme} style={{ borderRadius: 16, padding: '4px 12px' }} onClick={scrollToToday}>Heute</S.StyledNavBtn>
                <S.StyledNavBtn $mode={theme} onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}>‹</S.StyledNavBtn>
                <S.StyledNavBtn $mode={theme} onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}>›</S.StyledNavBtn>
                <S.StyledDateInput $mode={theme} type="date" defaultValue={formatDate(chartStartDate)} onBlur={e => handleDateChange('start', e.target.value)} />
                <span style={{ margin: '0 4px' }}>–</span>
                <S.StyledDateInput $mode={theme} type="date" defaultValue={formatDate(chartEndDate)} onBlur={e => handleDateChange('end', e.target.value)} />
              </S.StyledToolbarGroup>
              <S.StyledToolbarGroup $mode={theme}>
                <label>Zoom:</label>
                <S.StyledSlider type="range" min={0.5} max={60} step={0.5} value={dayWidth} onChange={e => setDayWidth(Number(e.target.value))} />
                <span style={{ fontSize: 11, color: '#888', width: 35 }}>{dayWidth}px</span>
              </S.StyledToolbarGroup>
              <S.StyledToolbarGroup $mode={theme}>
                <label>Höhe:</label>
                <S.StyledSlider type="range" min={45} max={135} value={rowHeight} onChange={e => setRowHeight(Number(e.target.value))} />
                <span style={{ fontSize: 11, color: '#888', width: 35 }}>{rowHeight}px</span>
              </S.StyledToolbarGroup>
              <S.StyledToggleBtn $mode={theme} $active={showConnections} onClick={toggleConnections}>
                Verbindungen
              </S.StyledToggleBtn>
            </S.StyledToolbarLeft>
            {selectedPhaseId && (
              <Button $variant="secondary" $size="small" onClick={toggleDetailPanel}>Details ☰</Button>
            )}
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
