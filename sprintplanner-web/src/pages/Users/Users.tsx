import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { S } from './Users.styles';
import { Button, Modal, Avatar, UserMenu } from '@/components';
import { useStore } from '@/store';
import { api } from '@/api';
import { User } from '@/api/types';

interface BoardMember {
  id: string;
  name?: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

interface UserBoard {
  id: string;
  name: string;
  description?: string;
  data?: string;
  isPublic?: boolean;
  updatedAt: string;
  members: BoardMember[];
}

interface MinimapProject {
  color: string;
  phases: { left: number; width: number }[];
}

const parseEmails = (text: string): string[] => {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  return [...new Set(text.match(emailRegex) || [])];
};

const getBoardMinimap = (board: UserBoard): MinimapProject[] | null => {
  if (!board.data) return null;
  try {
    const data = JSON.parse(board.data);
    if (!data.projects?.length) return null;
    const allPhases = data.projects.flatMap((p: any) => p.phases || []);
    if (!allPhases.length) return null;
    
    const minDate = Math.min(...allPhases.map((p: any) => new Date(p.start).getTime()));
    const maxDate = Math.max(...allPhases.map((p: any) => new Date(p.end).getTime()));
    const range = maxDate - minDate || 1;
    
    return data.projects.slice(0, 5).map((project: any) => ({
      color: project.color || '#6366f1',
      phases: (project.phases || []).map((phase: any) => {
        const start = new Date(phase.start).getTime();
        const end = new Date(phase.end).getTime();
        return {
          left: ((start - minDate) / range) * 100,
          width: Math.max(((end - start) / range) * 100, 2),
        };
      }),
    }));
  } catch { return null; }
};

export const Users = () => {
  const navigate = useNavigate();
  const { theme, user: currentUser } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState<{ type: 'invite' | 'delete'; user?: User } | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userBoards, setUserBoards] = useState<Record<string, UserBoard[]>>({});

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadUsers();
  }, [currentUser]);

  const loadUsers = async () => {
    const data = await api.getUsers();
    setUsers(data);
  };

  const handleInvite = async () => {
    if (emails.length === 0) return;
    for (const email of emails) {
      await api.inviteUser(email);
    }
    setModal(null);
    setEmails([]);
    setEmailInput('');
    loadUsers();
  };

  const addEmail = (value: string) => {
    const parsed = parseEmails(value);
    if (parsed.length > 0) {
      setEmails([...emails, ...parsed.filter(e => !emails.includes(e))]);
      setEmailInput('');
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && emailInput.trim()) {
      e.preventDefault();
      addEmail(emailInput);
    }
  };

  const handleEmailPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (text.includes('@')) {
      e.preventDefault();
      addEmail(text);
    }
  };

  const removeEmail = (email: string) => {
    setEmails(emails.filter(e => e !== email));
  };

  const handleDelete = async () => {
    if (!modal?.user) return;
    await api.deleteUser(modal.user.id);
    setModal(null);
    loadUsers();
  };

  const handleRoleChange = async (id: string, role: 'admin' | 'user' | 'viewer') => {
    await api.updateUserRole(id, role);
    loadUsers();
  };

  const toggleUserBoards = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    if (!userBoards[userId]) {
      const boards = await api.getUserBoards(userId);
      setUserBoards(prev => ({ ...prev, [userId]: boards }));
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <S.StyledContainer $mode={theme}>
      <S.StyledHeader $mode={theme}>
        <S.StyledHeaderLeft>
          <Button $variant="secondary" $size="small" onClick={() => navigate('/dashboard')}>← Dashboard</Button>
          <S.StyledTitle $mode={theme}>Benutzerverwaltung</S.StyledTitle>
        </S.StyledHeaderLeft>
        <UserMenu />
      </S.StyledHeader>

      <S.StyledContent>
        <S.StyledSection>
          <S.StyledSectionHeader>
            <S.StyledSectionTitle $mode={theme}>Benutzer</S.StyledSectionTitle>
            <Button onClick={() => { setEmails([]); setEmailInput(''); setModal({ type: 'invite' }); }}>+ Benutzer einladen</Button>
          </S.StyledSectionHeader>

          {users.length === 0 ? (
            <S.StyledEmpty $mode={theme}>Keine Benutzer</S.StyledEmpty>
          ) : (
            <S.StyledTable $mode={theme}>
              {users.map(u => (
                <S.StyledUserItem key={u.id}>
                  <S.StyledRow $mode={theme} $expandable={(u.owned || 0) > 0} onClick={() => (u.owned || 0) > 0 && toggleUserBoards(u.id)}>
                    {(u.owned || 0) > 0 && (
                      <S.StyledExpandIcon $expanded={expandedUser === u.id}>▶</S.StyledExpandIcon>
                    )}
                    <Avatar name={u.name || u.email} avatarUrl={u.avatarUrl} size={36} />
                    <S.StyledUserInfo>
                      <S.StyledUserName $mode={theme}>{u.name || u.email}</S.StyledUserName>
                      <S.StyledUserEmail $mode={theme}>{u.email}</S.StyledUserEmail>
                    </S.StyledUserInfo>
                    <S.StyledBoardStats $mode={theme}>
                      {u.owned || 0} Boards · {u.editor || 0} Editor · {u.viewer || 0} Viewer
                    </S.StyledBoardStats>
                    <S.StyledStatus $mode={theme} $status={u.status}>
                      {u.status === 'active' ? 'Aktiv' : 'Ausstehend'}
                    </S.StyledStatus>
                    {u.id !== currentUser?.id ? (
                      <>
                        <S.StyledSelect $mode={theme} value={u.role} onChange={e => { e.stopPropagation(); handleRoleChange(u.id, e.target.value as 'admin' | 'user' | 'viewer'); }} onClick={e => e.stopPropagation()}>
                          <option value="viewer">Betrachter</option>
                          <option value="user">Benutzer</option>
                          <option value="admin">Admin</option>
                        </S.StyledSelect>
                        <Button $variant="danger" $size="small" onClick={e => { e.stopPropagation(); setModal({ type: 'delete', user: u }); }}>Löschen</Button>
                      </>
                    ) : (
                      <>
                        <S.StyledRoleLabel $mode={theme}>Admin</S.StyledRoleLabel>
                        <div />
                      </>
                    )}
                  </S.StyledRow>
                  {expandedUser === u.id && userBoards[u.id] && (
                    <S.StyledBoardList $mode={theme}>
                      {userBoards[u.id].map(board => {
                        const minimap = getBoardMinimap(board);
                        return (
                          <Link key={board.id} to={`/gantt/${board.id}`} style={{ textDecoration: 'none' }}>
                            <S.StyledBoardItem $mode={theme}>
                              <S.StyledBoardInfo>
                                <S.StyledBoardName $mode={theme}>{board.name}</S.StyledBoardName>
                                {board.description && (
                                  <S.StyledBoardDesc $mode={theme}>
                                    {board.description.length > 150 ? board.description.slice(0, 150) + '…' : board.description}
                                  </S.StyledBoardDesc>
                                )}
                                <S.StyledBoardMeta $mode={theme}>
                                  {board.isPublic && <span>Öffentlich</span>}
                                  <span>Aktualisiert: {formatDate(board.updatedAt)}</span>
                                  {board.members.length > 0 && (
                                    <S.StyledBoardMembers>
                                      {board.members.slice(0, 4).map((m, i) => (
                                        <Avatar key={i} name={m.name || m.email} avatarUrl={m.avatarUrl} size={18} />
                                      ))}
                                      {board.members.length > 4 && <span>+{board.members.length - 4}</span>}
                                    </S.StyledBoardMembers>
                                  )}
                                </S.StyledBoardMeta>
                              </S.StyledBoardInfo>
                              {minimap && (
                                <S.StyledBoardMinimap $mode={theme}>
                                  {minimap.map((project, pIdx) => (
                                    <S.StyledMinimapRow key={pIdx}>
                                      {project.phases.map((phase, phIdx) => (
                                        <S.StyledMinimapPhase key={phIdx} style={{ left: `${phase.left}%`, width: `${phase.width}%`, background: project.color }} />
                                      ))}
                                    </S.StyledMinimapRow>
                                  ))}
                                </S.StyledBoardMinimap>
                              )}
                            </S.StyledBoardItem>
                          </Link>
                        );
                      })}
                    </S.StyledBoardList>
                  )}
                </S.StyledUserItem>
              ))}
            </S.StyledTable>
          )}
        </S.StyledSection>
      </S.StyledContent>

      {modal?.type === 'invite' && (
        <Modal title="Benutzer einladen" onClose={() => setModal(null)} footer={
          <>
            <Button $variant="secondary" onClick={() => setModal(null)}>Abbrechen</Button>
            <Button onClick={handleInvite} disabled={emails.length === 0}>Einladen</Button>
          </>
        }>
          <S.StyledChipContainer $mode={theme}>
            {emails.map(e => (
              <S.StyledChip key={e} $mode={theme}>
                {e}
                <S.StyledChipRemove onClick={() => removeEmail(e)}>×</S.StyledChipRemove>
              </S.StyledChip>
            ))}
            <S.StyledChipInput
              $mode={theme}
              type="email"
              placeholder={emails.length ? '' : 'E-Mail-Adressen eingeben oder einfügen...'}
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              onPaste={handleEmailPaste}
              autoFocus
            />
          </S.StyledChipContainer>
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal title="Benutzer löschen" onClose={() => setModal(null)} footer={
          <>
            <Button $variant="secondary" onClick={() => setModal(null)}>Abbrechen</Button>
            <Button $variant="danger" onClick={handleDelete}>Löschen</Button>
          </>
        }>
          <p>Möchtest du {modal.user?.email} wirklich löschen?</p>
        </Modal>
      )}
    </S.StyledContainer>
  );
};
