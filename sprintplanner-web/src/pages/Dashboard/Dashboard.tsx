import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { S } from './Dashboard.styles';
import { Button, Modal, Avatar, UserMenu } from '@/components';
import { useStore } from '@/store';
import { api } from '@/api';
import { Board } from '@/api/types';

interface BoardGroups {
  owned: Board[];
  shared: Board[];
  public: Board[];
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, user } = useStore();
  const [boards, setBoards] = useState<BoardGroups>({ owned: [], shared: [], public: [] });
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: 'create' | 'edit' | 'delete' | 'duplicate'; board?: Board } | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const data = await api.getBoards();
      setBoards({
        owned: (data.owned || []).map((b: Board) => ({ ...b, role: 'owner' as const })),
        shared: data.shared || [],
        public: (data.public || []).map((b: Board) => ({ ...b, role: 'viewer' as const })),
      });
    } catch (e) {
      console.error('Failed to load boards:', e);
    }
  };

  const openBoard = (id: string) => {
    window.location.href = `/board/${id}`;
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

  const shareBoard = (id: string) => {
    setMenuOpen(null);
    openBoard(id);
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('de-DE');

  const renderSection = (title: string, list: Board[], canEdit: boolean) => (
    <S.StyledSection>
      <S.StyledSectionTitle $mode={theme}>{title}</S.StyledSectionTitle>
      {list.length === 0 ? (
        <S.StyledEmpty $mode={theme}>Keine Boards</S.StyledEmpty>
      ) : (
        <S.StyledGrid>
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
              onShare={() => shareBoard(board.id)}
              onDelete={() => openDeleteModal(board)}
              formatDate={formatDate}
            />
          ))}
        </S.StyledGrid>
      )}
    </S.StyledSection>
  );

  return (
    <S.StyledContainer $mode={theme}>
      <S.StyledHeader $mode={theme}>
        <S.StyledHeaderLeft>
          <S.StyledTitle $mode={theme}>📋 Sprint Planner</S.StyledTitle>
          <S.StyledNav>
            <S.StyledNavItem $mode={theme} $active>Boards</S.StyledNavItem>
            {user?.role === 'admin' && (
              <S.StyledNavItem $mode={theme} onClick={() => navigate('/users')}>Benutzer</S.StyledNavItem>
            )}
          </S.StyledNav>
        </S.StyledHeaderLeft>
        <UserMenu />
      </S.StyledHeader>

      <S.StyledContent>
        {renderSection('Meine Boards', boards.owned, true)}
        {renderSection('Geteilt mit mir', boards.shared, false)}
        {renderSection('Öffentliche Boards', boards.public, false)}
      </S.StyledContent>

      <S.StyledFab $mode={theme} onClick={openCreateModal}>+ Neues Board</S.StyledFab>

      {modal?.type === 'create' && (
        <Modal title="Neues Board" onClose={() => setModal(null)} footer={
          <>
            <Button $variant="secondary" onClick={() => setModal(null)}>Abbrechen</Button>
            <Button onClick={handleCreate}>Erstellen</Button>
          </>
        }>
          <S.StyledInput $mode={theme} placeholder="Board-Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
          <S.StyledTextarea $mode={theme} placeholder="Beschreibung (optional)" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal title="Board bearbeiten" onClose={() => setModal(null)} footer={
          <>
            <Button $variant="secondary" onClick={() => setModal(null)}>Abbrechen</Button>
            <Button onClick={handleEdit}>Speichern</Button>
          </>
        }>
          <S.StyledInput $mode={theme} placeholder="Board-Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
          <S.StyledTextarea $mode={theme} placeholder="Beschreibung (optional)" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal title="Board löschen" onClose={() => setModal(null)} footer={
          <>
            <Button $variant="secondary" onClick={() => setModal(null)}>Abbrechen</Button>
            <Button $variant="danger" onClick={handleDelete}>Löschen</Button>
          </>
        }>
          <p>Möchtest du "{modal.board?.name}" wirklich löschen?</p>
        </Modal>
      )}

      {modal?.type === 'duplicate' && (
        <Modal title="Board duplizieren" onClose={() => setModal(null)} footer={
          <>
            <Button $variant="secondary" onClick={() => setModal(null)}>Abbrechen</Button>
            <Button onClick={handleDuplicate}>Duplizieren</Button>
          </>
        }>
          <S.StyledInput $mode={theme} placeholder="Name für die Kopie" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
        </Modal>
      )}
    </S.StyledContainer>
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
}

const BoardCard = ({ board, theme, menuOpen, canEdit, onOpen, onMenuToggle, onEdit, onDuplicate, onShare, onDelete, formatDate }: BoardCardProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <S.StyledCard $mode={theme} onClick={onOpen}>
      <S.StyledCardHeader>
        <S.StyledCardTitle $mode={theme}>{board.name}</S.StyledCardTitle>
        {canEdit && (
          <S.StyledMenu ref={menuRef} onClick={e => e.stopPropagation()}>
            <S.StyledMenuBtn $mode={theme} onClick={onMenuToggle}>⋮</S.StyledMenuBtn>
            <S.StyledMenuDropdown $mode={theme} $visible={menuOpen}>
              <S.StyledMenuItem $mode={theme} onClick={onEdit}>Bearbeiten</S.StyledMenuItem>
              <S.StyledMenuItem $mode={theme} onClick={onDuplicate}>Duplizieren</S.StyledMenuItem>
              <S.StyledMenuItem $mode={theme} onClick={onShare}>Teilen</S.StyledMenuItem>
              <S.StyledMenuItem $mode={theme} onClick={onDelete}>Löschen</S.StyledMenuItem>
            </S.StyledMenuDropdown>
          </S.StyledMenu>
        )}
      </S.StyledCardHeader>
      {board.description && <S.StyledCardDesc $mode={theme}>{board.description}</S.StyledCardDesc>}
      <S.StyledCardMeta $mode={theme}>Zuletzt geändert: {formatDate(board.updatedAt)}</S.StyledCardMeta>
      {board.members && board.members.length > 0 && (
        <S.StyledCardMembers>
          {board.members.slice(0, 4).map((m, i) => <Avatar key={i} name={m.name} avatarUrl={m.avatarUrl} size={24} />)}
          {board.members.length > 4 && <span style={{ fontSize: 11, color: '#888' }}>+{board.members.length - 4}</span>}
        </S.StyledCardMembers>
      )}
    </S.StyledCard>
  );
};
