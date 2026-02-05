import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { S } from './Users.styles';
import { Button, Modal, Avatar, UserMenu } from '@/components';
import { useStore } from '@/store';
import { api } from '@/api';
import { User } from '@/api/types';

const parseEmails = (text: string): string[] => {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  return [...new Set(text.match(emailRegex) || [])];
};

export const Users = () => {
  const navigate = useNavigate();
  const { theme, user: currentUser } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [modal, setModal] = useState<{ type: 'invite' | 'delete'; user?: User } | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');

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
                      <S.StyledSelect $mode={theme} value={u.role} onChange={e => handleRoleChange(u.id, e.target.value as 'admin' | 'user' | 'viewer')}>
                        <option value="viewer">Betrachter</option>
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
