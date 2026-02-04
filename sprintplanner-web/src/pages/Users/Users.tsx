import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { S } from './Users.styles';
import { Button, Modal, Avatar } from '@/components';
import { useStore } from '@/store';
import { api } from '@/api';
import { User } from '@/api/types';

export const Users = () => {
  const navigate = useNavigate();
  const { theme, user: currentUser } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState<{ type: 'invite' | 'delete'; user?: User } | null>(null);
  const [email, setEmail] = useState('');

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
    if (!email.trim()) return;
    await api.inviteUser(email.trim());
    setModal(null);
    setEmail('');
    loadUsers();
  };

  const handleDelete = async () => {
    if (!modal?.user) return;
    await api.deleteUser(modal.user.id);
    setModal(null);
    loadUsers();
  };

  const handleRoleChange = async (id: string, role: 'admin' | 'user') => {
    await api.updateUserRole(id, role);
    loadUsers();
  };

  return (
    <S.StyledContainer $mode={theme}>
      <S.StyledHeader $mode={theme}>
        <S.StyledTitle $mode={theme}>👥 Benutzerverwaltung</S.StyledTitle>
        <Button $variant="secondary" onClick={() => navigate('/dashboard')}>← Zurück zum Dashboard</Button>
      </S.StyledHeader>

      <S.StyledContent>
        <S.StyledSection>
          <S.StyledSectionHeader>
            <S.StyledSectionTitle $mode={theme}>Benutzer</S.StyledSectionTitle>
            <Button onClick={() => { setEmail(''); setModal({ type: 'invite' }); }}>+ Benutzer einladen</Button>
          </S.StyledSectionHeader>

          {users.length === 0 ? (
            <S.StyledEmpty $mode={theme}>Keine Benutzer</S.StyledEmpty>
          ) : (
            <S.StyledTable $mode={theme}>
              {users.map(u => (
                <S.StyledRow key={u.id} $mode={theme}>
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
                      <S.StyledSelect $mode={theme} value={u.role} onChange={e => handleRoleChange(u.id, e.target.value as 'admin' | 'user')}>
                        <option value="user">Benutzer</option>
                        <option value="admin">Admin</option>
                      </S.StyledSelect>
                      <Button $variant="danger" $size="small" onClick={() => setModal({ type: 'delete', user: u })}>Löschen</Button>
                    </>
                  ) : (
                    <>
                      <S.StyledRoleLabel $mode={theme}>Admin</S.StyledRoleLabel>
                      <div />
                    </>
                  )}
                </S.StyledRow>
              ))}
            </S.StyledTable>
          )}
        </S.StyledSection>
      </S.StyledContent>

      {modal?.type === 'invite' && (
        <Modal title="Benutzer einladen" onClose={() => setModal(null)} footer={
          <>
            <Button $variant="secondary" onClick={() => setModal(null)}>Abbrechen</Button>
            <Button onClick={handleInvite}>Einladen</Button>
          </>
        }>
          <S.StyledInput $mode={theme} type="email" placeholder="user@example.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
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
