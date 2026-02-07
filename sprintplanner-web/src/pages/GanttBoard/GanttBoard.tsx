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

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const extractId = (slug: string) => slug.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)?.[0] || slug;

export const GanttBoard = () => {
  const { id: rawId } = useParams<{ id: string }>();
  const id = rawId ? extractId(rawId) : undefined;
  const navigate = useNavigate();
  const { theme } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showShare, setShowShare] = useState(false);
  const [showEditBoard, setShowEditBoard] = useState(false);
  const [boardForm, setBoardForm] = useState({ name: '', description: '' });
  const [compactMode, setCompactMode] = useState(0); // 0=full, 1=no labels, 2=icons only
  
  const {
    boardName, boardDescription, boardRole, selectedPhaseId, showDetailPanel,
    dayWidth, rowHeight, chartStartDate, chartEndDate,
    showConnections, cursorSettings, activeUsers, topbarCollapsed,
    setBoard, setBoardDescription, setDayWidth, setRowHeight, setDateRange,
    toggleDetailPanel, toggleConnections, setCursorSettings, toggleTopbar
  } = useGanttStore();

  // Measure toolbar and set compact mode
  const collapseRef = useRef<HTMLButtonElement>(null);
  const thresholds = useRef<number[]>([0, 0, 0]); // Breiten bei denen kompaktiert wurde
  const lastWidth = useRef<number>(0);
  
  useEffect(() => {
    const toolbar = toolbarRef.current;
    const btn = collapseRef.current;
    if (!toolbar || !btn) return;
    
    const check = () => {
      const w = toolbar.clientWidth;
      // Nur prüfen wenn sich die Breite signifikant geändert hat
      if (Math.abs(w - lastWidth.current) < 10) return;
      lastWidth.current = w;
      
      const toolbarRect = toolbar.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const isVisible = btnRect.right <= toolbarRect.right + 5;
      
      if (!isVisible && compactMode < 3) {
        thresholds.current[compactMode] = w; // Merke Breite
        setCompactMode(m => m + 1);
      } else if (isVisible && compactMode > 0 && w > thresholds.current[compactMode - 1] + 50) {
        setCompactMode(m => m - 1);
      }
    };
    
    const observer = new ResizeObserver(check);
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, [compactMode]);

  // Realtime: SSE for updates, WebSocket for cursors
  useRealtime(id);
  
  // Auto-save changes to backend
  useAutoSave();

  useEffect(() => {
    // Reset data immediately when board ID changes
    useGanttStore.setState({ data: { projects: [], connections: [] } });
    loadBoard();
  }, [id]);

  const loadBoard = async () => {
    if (!id) {
      navigate('/dashboard');
      return;
    }
    try {
      const board = await api.getBoard(id);
      if (!board?.id) {
        navigate('/dashboard');
        return;
      }
      const boardData = JSON.parse(board.data || '{"projects":[],"connections":[]}');
      setBoard(board.id, board.name, board.role, boardData);
      setBoardDescription(board.description || '');
      
      // Update URL with board name slug
      const slug = board.name ? `${slugify(board.name)}-${board.id}` : board.id;
      window.history.replaceState(null, '', `/board/${slug}`);
      
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
    } catch (err) {
      console.error('Failed to load board:', err);
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
    // Update URL with new board name slug
    const slug = `${slugify(boardForm.name)}-${id}`;
    window.history.replaceState(null, '', `/board/${slug}`);
    setShowEditBoard(false);
  };

  return (
    <S.StyledContainer $mode={theme}>
      {/* Top Toolbar */}
      <S.StyledToolbar $mode={theme} $collapsed={topbarCollapsed}>
        {topbarCollapsed ? (
          <>
            <S.StyledBackLink to="/dashboard">
              <S.StyledBackBtn $mode={theme} as="span">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
              </S.StyledBackBtn>
            </S.StyledBackLink>
            <S.StyledBoardName>{boardName}</S.StyledBoardName>
            <div style={{ flex: 1 }} />
            <S.StyledCursorDropdown $mode={theme}>
              <S.StyledCursorDropdownBtn $mode={theme}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L5.94 2.35a.5.5 0 0 0-.44.86z"/>
                </svg>
              </S.StyledCursorDropdownBtn>
              <S.StyledCursorDropdownMenu $mode={theme}>
                <S.StyledCursorDropdownItem $mode={theme} onClick={() => handleCursorSettingChange('showOthers', !cursorSettings.showOthers)}>
                  <S.StyledCheckIcon $visible={cursorSettings.showOthers} /> Cursor anderer
                </S.StyledCursorDropdownItem>
                <S.StyledCursorDropdownItem $mode={theme} onClick={() => handleCursorSettingChange('showMy', !cursorSettings.showMy)}>
                  <S.StyledCheckIcon $visible={cursorSettings.showMy} /> Mein Cursor
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
              <S.StyledIconBtn $mode={theme} title="Teilen" onClick={() => setShowShare(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
              </S.StyledIconBtn>
            )}
            <S.StyledCollapseTopbarBtn $mode={theme} onClick={toggleTopbar} title="Navigation einblenden">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </S.StyledCollapseTopbarBtn>
            <UserMenu size={32} />
          </>
        ) : (
          <>
        <S.StyledBackLink to="/dashboard">
          <S.StyledBackBtn $mode={theme} as="span">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </S.StyledBackBtn>
        </S.StyledBackLink>
        <S.StyledTitleGroup>
          <S.StyledBoardName>{boardName}</S.StyledBoardName>
          {boardDescription && <S.StyledBoardDesc $mode={theme} title={boardDescription}>{boardDescription}</S.StyledBoardDesc>}
          {boardRole !== 'viewer' && (
            <S.StyledIconBtn $mode={theme} title="Board bearbeiten" onClick={openEditBoard}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </S.StyledIconBtn>
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
                <S.StyledCheckIcon $visible={cursorSettings.showOthers} /> Cursor von Mitbearbeitern anzeigen
              </S.StyledCursorDropdownItem>
              <S.StyledCursorDropdownItem $mode={theme} onClick={() => handleCursorSettingChange('showMy', !cursorSettings.showMy)}>
                <S.StyledCheckIcon $visible={cursorSettings.showMy} /> Meinen Cursor anzeigen
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
            <Button onClick={() => setShowShare(true)}>Teilen</Button>
          )}
        </S.StyledToolbarRight>
        <UserMenu />
          </>
        )}
      </S.StyledToolbar>

      <S.StyledMainContainer>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <S.StyledMainContent>
          {/* Chart Toolbar */}
          {!topbarCollapsed && (
          <S.StyledChartToolbar $mode={theme} ref={toolbarRef}>
            <S.StyledToolbarLeft>
              <S.StyledToolbarGroup $mode={theme}>
                <S.StyledNavBtn $mode={theme} style={{ borderRadius: 16, padding: '4px 12px' }} onClick={scrollToToday}>Heute</S.StyledNavBtn>
                <S.StyledNavBtn $mode={theme} onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}>‹</S.StyledNavBtn>
                <S.StyledNavBtn $mode={theme} onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}>›</S.StyledNavBtn>
                <S.StyledDateInput $mode={theme} type="date" defaultValue={formatDate(chartStartDate)} onBlur={e => handleDateChange('start', e.target.value)} />
                <span style={{ margin: '0 4px' }}>–</span>
                <S.StyledDateInput $mode={theme} type="date" defaultValue={formatDate(chartEndDate)} onBlur={e => handleDateChange('end', e.target.value)} />
              </S.StyledToolbarGroup>
              <S.StyledSliderPopover $mode={theme} $compact={compactMode >= 3}>
                {compactMode < 3 && <label>Zoom:</label>}
                {compactMode < 3 ? (
                  <div className="inline-slider">
                    <S.StyledSlider type="range" min={0.5} max={60} step={0.5} value={dayWidth} onChange={e => setDayWidth(Number(e.target.value))} />
                    <span style={{ fontSize: 11, color: '#888', width: 35 }}>{dayWidth}px</span>
                  </div>
                ) : (
                  <>
                    <S.StyledSliderBtn $mode={theme} title="Zoom">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                      </svg>
                    </S.StyledSliderBtn>
                    <S.StyledSliderDropdown $mode={theme}>
                      <div>
                        <S.StyledSlider type="range" min={0.5} max={60} step={0.5} value={dayWidth} onChange={e => setDayWidth(Number(e.target.value))} />
                        <span>{dayWidth}px</span>
                      </div>
                    </S.StyledSliderDropdown>
                  </>
                )}
              </S.StyledSliderPopover>
              <S.StyledSliderPopover $mode={theme} $compact={compactMode >= 2}>
                {compactMode < 2 && <label>Höhe:</label>}
                {compactMode < 2 ? (
                  <div className="inline-slider">
                    <S.StyledSlider type="range" min={45} max={135} value={rowHeight} onChange={e => setRowHeight(Number(e.target.value))} />
                    <span style={{ fontSize: 11, color: '#888', width: 35 }}>{rowHeight}px</span>
                  </div>
                ) : (
                  <>
                    <S.StyledSliderBtn $mode={theme} title="Höhe">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="3" x2="12" y2="21" />
                        <polyline points="8 7 12 3 16 7" />
                        <polyline points="8 17 12 21 16 17" />
                      </svg>
                    </S.StyledSliderBtn>
                    <S.StyledSliderDropdown $mode={theme}>
                      <div>
                        <S.StyledSlider type="range" min={45} max={135} value={rowHeight} onChange={e => setRowHeight(Number(e.target.value))} />
                        <span>{rowHeight}px</span>
                      </div>
                    </S.StyledSliderDropdown>
                  </>
                )}
              </S.StyledSliderPopover>
              <S.StyledToggleBtn $mode={theme} $active={showConnections} onClick={toggleConnections} title="Verbindungen">
                {compactMode >= 1 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                    <path d="M7 12 C 10 6, 14 18, 17 12" />
                  </svg>
                )}
                {compactMode < 1 && <span>Verbindungen</span>}
              </S.StyledToggleBtn>
            </S.StyledToolbarLeft>
            <S.StyledToolbarRight>
              {selectedPhaseId && !showDetailPanel && (
                <Button $variant="secondary" $size="small" onClick={toggleDetailPanel}>Details ☰</Button>
              )}
              <S.StyledCollapseTopbarBtn ref={collapseRef} $mode={theme} onClick={toggleTopbar} title="Navigation ausblenden">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </S.StyledCollapseTopbarBtn>
            </S.StyledToolbarRight>
          </S.StyledChartToolbar>
          )}

          {/* Gantt Chart */}
          <S.StyledGanttOuter>
            <GanttChart scrollRef={scrollRef} />
            <Minimap scrollRef={scrollRef} />
          </S.StyledGanttOuter>
        </S.StyledMainContent>

        {/* Detail Panel */}
        <DetailPanel />
      </S.StyledMainContainer>

      {showShare && id && <ShareModal boardId={id} boardName={boardName} onClose={() => setShowShare(false)} />}
      
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
