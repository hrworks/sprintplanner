import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { S } from './Dashboard.styles';
import { Button, Modal, Avatar, UserMenu } from '@/components';
import { useStore } from '@/store';
import { api } from '@/api';
import { Board } from '@/api/types';
import { ShareModal } from '../GanttBoard/components/ShareModal';
import type { BoardData, Phase } from '../GanttBoard/types';

interface BoardGroups {
  owned: Board[];
  shared: Board[];
  public: Board[];
}

type PhaseStatus = 'complete' | 'active' | 'planned' | 'overdue';

// Minimap-Daten für ein Board
interface MinimapData {
  projects: {
    name: string;
    color: string;
    phases: { left: number; width: number; color: string; status: PhaseStatus }[];
  }[];
  totalPhases: number;
  completePhases: number;
  todayPosition: number | null; // Position der "Heute"-Linie in %
}

// Berechne Phase-Status basierend auf Datum
const getPhaseStatus = (phase: Phase): PhaseStatus => {
  const now = new Date();
  const start = new Date(phase.start);
  const end = new Date(phase.end);
  
  if (end < now) return 'complete';
  if (start <= now && end >= now) return 'active';
  return 'planned';
};

// Extrahiere Minimap-Daten aus Board
const getBoardMinimap = (board: Board): MinimapData | null => {
  if (!board.data) return null;
  
  try {
    const data: BoardData = JSON.parse(board.data);
    if (!data.projects?.length) return null;
    
    // Finde Gesamtzeitspanne
    const allPhases = data.projects.flatMap(p => p.phases);
    if (!allPhases.length) return null;
    
    const minDate = Math.min(...allPhases.map(p => new Date(p.start).getTime()));
    const maxDate = Math.max(...allPhases.map(p => new Date(p.end).getTime()));
    const totalRange = maxDate - minDate || 1;
    
    // Heute-Position berechnen
    const now = Date.now();
    const todayPosition = now >= minDate && now <= maxDate 
      ? ((now - minDate) / totalRange) * 100 
      : null;
    
    const projects = data.projects.slice(0, 5).map(project => ({
      name: project.name,
      color: project.color,
      phases: project.phases.map(phase => {
        const start = new Date(phase.start).getTime();
        const end = new Date(phase.end).getTime();
        return {
          left: ((start - minDate) / totalRange) * 100,
          width: Math.max(((end - start) / totalRange) * 100, 2),
          color: phase.color,
          status: getPhaseStatus(phase),
        };
      }),
    }));
    
    const completePhases = allPhases.filter(p => getPhaseStatus(p) === 'complete').length;
    
    return { projects, totalPhases: allPhases.length, completePhases, todayPosition };
  } catch {
    return null;
  }
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, user } = useStore();
  const [boards, setBoards] = useState<BoardGroups>({ owned: [], shared: [], public: [] });
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: 'create' | 'edit' | 'delete' | 'duplicate'; board?: Board } | null>(null);
  const [shareModal, setShareModal] = useState<{ boardId: string; boardName: string } | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    loadBoards();
    const handleFocus = () => loadBoards();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const data = await api.getBoards();
      setBoards({
        owned: (data.owned || []).map((b: Board) => ({ ...b, role: 'owner' as const })),
        shared: data.shared || [],
        public: (data.public || []).map((b: Board) => ({ ...b, role: 'viewer' as const })),
      });
    } catch (e) {
      console.error('Failed to load boards:', e);
    } finally {
      setLoading(false);
    }
  };

  const openBoard = (id: string) => {
    window.location.href = `/gantt/${id}`;
  };

  const handleCreate = async () => {
    const board = await api.createBoard(form.name || 'Neues Board', form.description);
    setModal(null);
    openBoard(board.id);
  };

  const handleEdit = async () => {
    if (!modal?.board) return;
    await api.updateBoard(modal.board.id, { name: form.name, description: form.description });
    setModal(null);
    loadBoards();
  };

  const handleDelete = async () => {
    if (!modal?.board) return;
    await api.deleteBoard(modal.board.id);
    setModal(null);
    loadBoards();
  };

  const handleDuplicate = async () => {
    if (!modal?.board) return;
    const original = await api.getBoard(modal.board.id);
    const board = await api.createBoard(form.name || 'Kopie', modal.board.description, original.data);
    setModal(null);
    openBoard(board.id);
  };

  const openCreateModal = () => {
    setForm({ name: 'Neues Board', description: '' });
    setModal({ type: 'create' });
  };

  const openEditModal = (board: Board) => {
    setForm({ name: board.name, description: board.description || '' });
    setModal({ type: 'edit', board });
    setMenuOpen(null);
  };

  const openDeleteModal = (board: Board) => {
    setModal({ type: 'delete', board });
    setMenuOpen(null);
  };

  const openDuplicateModal = (board: Board) => {
    setForm({ name: 'Kopie von ' + board.name, description: board.description || '' });
    setModal({ type: 'duplicate', board });
    setMenuOpen(null);
  };

  const shareBoard = (board: Board) => {
    setMenuOpen(null);
    setShareModal({ boardId: board.id, boardName: board.name });
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('de-DE');

  const renderSection = (title: string, list: Board[], canEdit: boolean) => {
    const isEmpty = list.length === 0 && !loading;
    const isOwned = title === 'Meine Boards';

    return (
      <S.Section>
        <S.SectionHeader>
          <S.SectionTitle $mode={theme}>{title}</S.SectionTitle>
          {!loading && <S.SectionCount $mode={theme}>{list.length}</S.SectionCount>}
        </S.SectionHeader>
        
        {loading ? (
          <S.Grid>
            {[1, 2, 3].map(i => <S.SkeletonCard key={i} $mode={theme} />)}
          </S.Grid>
        ) : isEmpty ? (
          <S.Empty $mode={theme}>
            <S.EmptyIcon $mode={theme}>{isOwned ? '📋' : '🔗'}</S.EmptyIcon>
            <S.EmptyText $mode={theme}>
              {isOwned ? 'Noch keine Boards erstellt' : 'Keine Boards in dieser Kategorie'}
            </S.EmptyText>
            {isOwned && (
              <Button onClick={openCreateModal}>Erstes Board erstellen</Button>
            )}
          </S.Empty>
        ) : (
          <S.Grid>
            {list.map(board => (
              <BoardCard
                key={board.id}
                board={board}
                theme={theme}
                menuOpen={menuOpen === board.id}
                canEdit={canEdit}
                onOpen={() => openBoard(board.id)}
                onMenuToggle={() => setMenuOpen(menuOpen === board.id ? null : board.id)}
                onEdit={() => openEditModal(board)}
                onDuplicate={() => openDuplicateModal(board)}
                onShare={() => shareBoard(board)}
                onDelete={() => openDeleteModal(board)}
                formatDate={formatDate}
                minimap={getBoardMinimap(board)}
              />
            ))}
          </S.Grid>
        )}
      </S.Section>
    );
  };

  return (
    <S.Container $mode={theme}>
      <S.Header $mode={theme}>
        <S.HeaderLeft>
          <S.Title $mode={theme}>
            <img src="/favicon.png" alt="" style={{ width: 24, height: 24 }} />
            Sprint Planner
          </S.Title>
          <S.Nav>
            <S.NavItem $mode={theme} $active>Boards</S.NavItem>
            {user?.role === 'admin' && (
              <S.NavItem $mode={theme} onClick={() => navigate('/users')}>Benutzer</S.NavItem>
            )}
          </S.Nav>
        </S.HeaderLeft>
        <UserMenu />
      </S.Header>

      <S.Content>
        {renderSection('Meine Boards', boards.owned, true)}
        {renderSection('Geteilt mit mir', boards.shared, false)}
        {renderSection('Öffentliche Boards', boards.public, false)}
      </S.Content>

      <S.Fab $mode={theme} onClick={openCreateModal}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Neues Board
      </S.Fab>

      {modal?.type === 'create' && (
        <Modal title="Neues Board" onClose={() => setModal(null)} footer={
          <>
            <Button $variant="secondary" onClick={() => setModal(null)}>Abbrechen</Button>
            <Button onClick={handleCreate}>Erstellen</Button>
          </>
        }>
          <S.Input $mode={theme} placeholder="Board-Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
          <S.Textarea $mode={theme} placeholder="Beschreibung (optional)" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal title="Board bearbeiten" onClose={() => setModal(null)} footer={
          <>
            <Button $variant="secondary" onClick={() => setModal(null)}>Abbrechen</Button>
            <Button onClick={handleEdit}>Speichern</Button>
          </>
        }>
          <S.Input $mode={theme} placeholder="Board-Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
          <S.Textarea $mode={theme} placeholder="Beschreibung (optional)" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal title="Board löschen" onClose={() => setModal(null)} footer={
          <>
            <Button $variant="secondary" onClick={() => setModal(null)}>Abbrechen</Button>
            <Button $variant="danger" onClick={handleDelete}>Löschen</Button>
          </>
        }>
          <p>Möchtest du das Board <strong>"{modal.board?.name}"</strong> wirklich löschen?</p>
        </Modal>
      )}

      {modal?.type === 'duplicate' && (
        <Modal title="Board duplizieren" onClose={() => setModal(null)} footer={
          <>
            <Button $variant="secondary" onClick={() => setModal(null)}>Abbrechen</Button>
            <Button onClick={handleDuplicate}>Duplizieren</Button>
          </>
        }>
          <S.Input $mode={theme} placeholder="Name für die Kopie" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
        </Modal>
      )}

      {shareModal && (
        <ShareModal
          boardId={shareModal.boardId}
          boardName={shareModal.boardName}
          onClose={() => setShareModal(null)}
          onUpdate={loadBoards}
        />
      )}
    </S.Container>
  );
};

interface BoardCardProps {
  board: Board;
  theme: 'dark' | 'light';
  menuOpen: boolean;
  canEdit: boolean;
  onOpen: () => void;
  onMenuToggle: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onDelete: () => void;
  formatDate: (d: string) => string;
  minimap: MinimapData | null;
}

const BoardCard = ({ board, theme, menuOpen, canEdit, onOpen, onMenuToggle, onEdit, onDuplicate, onShare, onDelete, formatDate, minimap }: BoardCardProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const hasMembers = board.members && board.members.length > 0;
  const hasBadges = board.isPublic || board.allowedDomain;

  return (
    <S.Card $mode={theme} onClick={onOpen}>
      <S.CardHeader>
        <div>
          <S.CardTitle $mode={theme}>{board.name}</S.CardTitle>
          <S.CardDesc $mode={theme}>{board.description || '\u00A0'}</S.CardDesc>
        </div>
        {canEdit && (
          <S.Menu ref={menuRef} onClick={e => e.stopPropagation()}>
            <S.MenuBtn $mode={theme} onClick={onMenuToggle}>⋮</S.MenuBtn>
            <S.MenuDropdown $mode={theme} $visible={menuOpen}>
              <S.MenuItem $mode={theme} onClick={onEdit}>Bearbeiten</S.MenuItem>
              <S.MenuItem $mode={theme} onClick={onDuplicate}>Duplizieren</S.MenuItem>
              <S.MenuItem $mode={theme} onClick={onShare}>Teilen</S.MenuItem>
              <S.MenuItem $mode={theme} $danger onClick={onDelete}>Löschen</S.MenuItem>
            </S.MenuDropdown>
          </S.Menu>
        )}
      </S.CardHeader>
      
      <S.CardBody>
        {minimap ? (
          <>
            <S.Minimap $mode={theme}>
              {minimap.todayPosition !== null && (
                <S.MinimapToday $mode={theme} style={{ left: `${minimap.todayPosition}%` }} />
              )}
              {minimap.projects.map((project, i) => (
                <S.MinimapRow key={i}>
                  {project.phases.map((phase, j) => (
                    <S.MinimapPhase
                      key={j}
                      $mode={theme}
                      $status={phase.status}
                      style={{ left: `${phase.left}%`, width: `${phase.width}%`, background: phase.color }}
                    />
                  ))}
                </S.MinimapRow>
              ))}
            </S.Minimap>
            <S.CardProgress $mode={theme}>
              <S.ProgressDot $mode={theme} $status={minimap.completePhases === minimap.totalPhases ? 'complete' : minimap.completePhases > 0 ? 'active' : 'planned'} />
              {minimap.completePhases} von {minimap.totalPhases} Phasen · {minimap.projects.length} Projekte
            </S.CardProgress>
          </>
        ) : (
          <S.CardProgress $mode={theme}>
            <S.ProgressDot $mode={theme} $status="planned" />
            Noch keine Phasen
          </S.CardProgress>
        )}
      </S.CardBody>
      
      <S.CardMeta $mode={theme}>Aktualisiert: {formatDate(board.updatedAt)}</S.CardMeta>
      
      <S.CardFooter>
        {hasMembers ? (
          <S.CardMembers>
            {board.members!.slice(0, 3).map((m, i) => <Avatar key={i} name={m.name} avatarUrl={m.avatarUrl} size={22} />)}
            {board.members!.length > 3 && <S.MemberOverflow $mode={theme}>+{board.members!.length - 3}</S.MemberOverflow>}
          </S.CardMembers>
        ) : <div />}
        
        {hasBadges && (
          <S.BadgeGroup>
            {board.isPublic && <S.Badge $mode={theme}>Öffentlich</S.Badge>}
            {board.allowedDomain && <S.Badge $mode={theme}>@{board.allowedDomain}</S.Badge>}
          </S.BadgeGroup>
        )}
      </S.CardFooter>
    </S.Card>
  );
};
