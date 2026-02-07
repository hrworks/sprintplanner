import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Avatar } from '@/components';
import { useStore } from '@/store';
import { t, ThemeMode } from '@/styles';
import { api } from '@/api';

interface Member {
  id: string;
  email: string;
  role: string;
  user?: { name: string; avatarUrl?: string };
}

interface Props {
  boardId: string;
  boardName?: string;
  onClose: () => void;
  onUpdate?: () => void;
}

interface PendingInvite {
  email: string;
}

export const ShareModal = ({ boardId, boardName, onClose, onUpdate }: Props) => {
  const { theme, user } = useStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [owner, setOwner] = useState<{ name: string; email: string; avatarUrl?: string } | null>(null);
  const [accessMode, setAccessMode] = useState<'restricted' | 'domain' | 'public'>('restricted');
  const [allowedDomain, setAllowedDomain] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [role, setRole] = useState('editor');
  const [message, setMessage] = useState('');
  const [notify, setNotify] = useState(true);
  const [showAccessMenu, setShowAccessMenu] = useState(false);

  const ownerDomain = owner?.email?.split('@')[1];
  const isInviteMode = pendingInvites.length > 0;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [membersData, board] = await Promise.all([
      api.getMembers(boardId),
      api.getBoard(boardId)
    ]);
    setMembers(membersData);
    if (board.owner) {
      setOwner({ name: board.owner.name, email: board.owner.email, avatarUrl: board.owner.avatarUrl });
    }
    if (board.isPublic) {
      setAccessMode('public');
    } else if (board.allowedDomain) {
      setAccessMode('domain');
      setAllowedDomain(board.allowedDomain);
    } else {
      setAccessMode('restricted');
    }
  };

  const addEmailAsChip = (emailValue: string) => {
    const trimmed = emailValue.trim();
    if (trimmed.includes('@') && !pendingInvites.find(p => p.email === trimmed)) {
      setPendingInvites([...pendingInvites, { email: trimmed }]);
      setEmail('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith(',') || value.endsWith(';')) {
      addEmailAsChip(value.slice(0, -1));
    } else {
      setEmail(value);
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email.trim()) {
      e.preventDefault();
      addEmailAsChip(email);
    }
  };

  const removeInvite = (emailToRemove: string) => {
    setPendingInvites(pendingInvites.filter(p => p.email !== emailToRemove));
  };

  const handleSend = async () => {
    const msg = notify ? message : undefined;
    for (const invite of pendingInvites) {
      await api.inviteMember(boardId, invite.email, role, msg);
    }
    setPendingInvites([]);
    setMessage('');
    loadData();
    onUpdate?.();
  };

  const handleRemove = async (memberId: string) => {
    await api.removeMember(boardId, memberId);
    loadData();
    onUpdate?.();
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    await api.updateMemberRole(boardId, memberId, newRole);
    loadData();
  };

  const handleAccessChange = async (mode: 'restricted' | 'domain' | 'public') => {
    setAccessMode(mode);
    setShowAccessMenu(false);
    if (mode === 'public') {
      await api.updateBoard(boardId, { isPublic: true, allowedDomain: null });
    } else if (mode === 'domain' && ownerDomain) {
      setAllowedDomain(ownerDomain);
      await api.updateBoard(boardId, { isPublic: false, allowedDomain: ownerDomain });
    } else {
      await api.updateBoard(boardId, { isPublic: false, allowedDomain: null });
    }
    onUpdate?.();
  };

  const parseEmails = (text: string): string[] => {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    return [...new Set(text.match(emailRegex) || [])];
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    const emails = parseEmails(pastedText);
    if (emails.length > 0) {
      e.preventDefault();
      const newInvites = emails.filter(em => !pendingInvites.find(p => p.email === em));
      setPendingInvites([...pendingInvites, ...newInvites.map(email => ({ email }))]);
      setEmail('');
    }
  };

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const copyLink = () => {
    const slug = boardName ? `${slugify(boardName)}-${boardId}` : boardId;
    navigator.clipboard.writeText(`${window.location.origin}/board/${slug}`);
  };

  const goBack = () => {
    setPendingInvites([]);
    setEmail('');
    setMessage('');
  };

  return (
    <Overlay $mode={theme} onClick={e => e.target === e.currentTarget && onClose()}>
      <Modal $mode={theme}>
        <Header $mode={theme}>
          {isInviteMode && <BackBtn $mode={theme} onClick={goBack}>←</BackBtn>}
          <Title $mode={theme}>„{boardName || 'Board'}" teilen</Title>
        </Header>

        {isInviteMode ? (
          <>
            <InputRow>
              <ChipContainer $mode={theme}>
                {pendingInvites.map(inv => (
                  <Chip key={inv.email} $mode={theme}>
                    {inv.email}
                    <ChipRemove onClick={() => removeInvite(inv.email)}>×</ChipRemove>
                  </Chip>
                ))}
                <ChipInput
                  $mode={theme}
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyDown={handleEmailKeyDown}
                  onPaste={handlePaste}
                  placeholder={pendingInvites.length ? '' : 'Weitere hinzufügen...'}
                  autoFocus
                />
              </ChipContainer>
              <RoleSelect $mode={theme} value={role} onChange={e => setRole(e.target.value)}>
                <option value="editor">Mitbearbeiter</option>
                <option value="viewer">Betrachter</option>
              </RoleSelect>
            </InputRow>

            <NotifyRow $mode={theme}>
              <Checkbox type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} />
              <span>Personen benachrichtigen</span>
            </NotifyRow>

            <MessageArea
              $mode={theme}
              placeholder="Nachricht"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
            />

            <Footer>
              <LinkBtn $mode={theme} onClick={copyLink}>🔗</LinkBtn>
              <FooterRight>
                <CancelBtn $mode={theme} onClick={goBack}>Abbrechen</CancelBtn>
                <SendBtn $mode={theme} onClick={handleSend} disabled={pendingInvites.length === 0}>Senden</SendBtn>
              </FooterRight>
            </Footer>
          </>
        ) : (
          <>
            <EmailInput
              $mode={theme}
              type="email"
              placeholder="Personen hinzufügen..."
              value={email}
              onChange={handleEmailChange}
              onKeyDown={handleEmailKeyDown}
              onPaste={handlePaste}
            />

            <Section>
              <SectionHeader>
                <SectionTitle $mode={theme}>Personen mit Zugriff</SectionTitle>
                <CopyEmailsBtn $mode={theme} onClick={() => {
                  const emails = [owner?.email, ...members.map(m => m.email)].filter(Boolean).join(', ');
                  navigator.clipboard.writeText(emails);
                }} title="Email-Adressen von Mitarbeitern kopieren">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                </CopyEmailsBtn>
              </SectionHeader>
              <MemberList>
                {owner && (
                  <MemberItem $mode={theme}>
                    <MemberInfo>
                      <Avatar name={owner.name} avatarUrl={owner.avatarUrl} size={36} />
                      <MemberDetails>
                        <MemberName $mode={theme}>
                          {owner.name}
                          {owner.email === user?.email && ' (du)'}
                        </MemberName>
                        <MemberEmail $mode={theme}>{owner.email}</MemberEmail>
                      </MemberDetails>
                    </MemberInfo>
                    <RoleLabel $mode={theme}>Eigentümer</RoleLabel>
                  </MemberItem>
                )}
                {members.filter(m => m.role !== 'owner').map(m => (
                  <MemberItem key={m.id} $mode={theme}>
                    <MemberInfo>
                      <Avatar name={m.user?.name || m.email} avatarUrl={m.user?.avatarUrl} size={36} />
                      <MemberDetails>
                        <MemberName $mode={theme}>
                          {m.user?.name || m.email}
                          {m.email === user?.email && ' (du)'}
                        </MemberName>
                        <MemberEmail $mode={theme}>{m.email}</MemberEmail>
                      </MemberDetails>
                    </MemberInfo>
                    <MemberRole $mode={theme}>
                      <select value={m.role} onChange={e => handleRoleChange(m.id, e.target.value)}>
                        <option value="editor">Mitbearbeiter</option>
                        <option value="viewer">Betrachter</option>
                      </select>
                      <RemoveBtn $mode={theme} onClick={() => handleRemove(m.id)}>×</RemoveBtn>
                    </MemberRole>
                  </MemberItem>
                ))}
              </MemberList>
            </Section>

            <Section>
              <SectionTitle $mode={theme}>Allgemeiner Zugriff</SectionTitle>
              <AccessWrapper>
                <AccessRow $mode={theme} onClick={() => setShowAccessMenu(!showAccessMenu)}>
                  <AccessIcon $mode={theme}>
                    {accessMode === 'public' ? '🌐' : '🔒'}
                  </AccessIcon>
                  <AccessInfo>
                    <AccessTitleRow>
                      <AccessTitle $mode={theme}>
                        {accessMode === 'restricted' && 'Eingeschränkt'}
                        {accessMode === 'domain' && (allowedDomain?.split('.')[0]?.toUpperCase() || 'Domain')}
                        {accessMode === 'public' && 'Jeder mit dem Link'}
                      </AccessTitle>
                      <Chevron $mode={theme}>▼</Chevron>
                    </AccessTitleRow>
                    <AccessDesc $mode={theme}>
                      {accessMode === 'restricted' && 'Nur Personen mit Zugriff können öffnen'}
                      {accessMode === 'domain' && `Jeder bei ${allowedDomain} kann sehen`}
                      {accessMode === 'public' && 'Jeder mit dem Link kann sehen'}
                    </AccessDesc>
                  </AccessInfo>
                </AccessRow>
                {showAccessMenu && (
                  <AccessMenu $mode={theme}>
                    <AccessMenuItem $mode={theme} $active={accessMode === 'restricted'} onClick={() => handleAccessChange('restricted')}>
                      <CheckMark $visible={accessMode === 'restricted'} />Eingeschränkt
                    </AccessMenuItem>
                    {ownerDomain && (
                      <AccessMenuItem $mode={theme} $active={accessMode === 'domain'} onClick={() => handleAccessChange('domain')}>
                        <CheckMark $visible={accessMode === 'domain'} />{ownerDomain.split('.')[0].toUpperCase()}
                      </AccessMenuItem>
                    )}
                    <AccessMenuItem $mode={theme} $active={accessMode === 'public'} onClick={() => handleAccessChange('public')}>
                      <CheckMark $visible={accessMode === 'public'} />Jeder mit dem Link
                    </AccessMenuItem>
                  </AccessMenu>
                )}
              </AccessWrapper>
            </Section>

            <Footer>
              <LinkBtnText $mode={theme} onClick={copyLink}>
                🔗 Link kopieren
              </LinkBtnText>
              <DoneBtn $mode={theme} onClick={onClose}>Fertig</DoneBtn>
            </Footer>
          </>
        )}
      </Modal>
    </Overlay>
  );
};

// === STYLES ===
const Overlay = styled.div<{ $mode: ThemeMode }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.lg};
  width: 480px;
  max-height: 90vh;
  overflow: visible;
  padding: ${t('dark').space.lg};
  box-shadow: ${t('dark').shadow.lg};
`;

const Header = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.md};
  margin-bottom: ${t('dark').space.lg};
`;

const BackBtn = styled.button<{ $mode: ThemeMode }>`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${p => t(p.$mode).ink};
  padding: ${t('dark').space.xs} ${t('dark').space.sm};
  border-radius: ${t('dark').radius.sm};
  transition: background ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).panel};
  }
`;

const Title = styled.h2<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.lg};
  font-weight: 600;
  color: ${p => t(p.$mode).ink};
  margin: 0;
`;

const EmailInput = styled.input<{ $mode: ThemeMode }>`
  width: 100%;
  padding: ${t('dark').space.md};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  background: ${p => t(p.$mode).canvas};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.base};
  margin-bottom: ${t('dark').space.lg};
  
  &:focus {
    outline: none;
    border-color: ${p => t(p.$mode).action};
  }
  
  &::placeholder {
    color: ${p => t(p.$mode).inkFaint};
  }
`;

const InputRow = styled.div`
  display: flex;
  gap: ${t('dark').space.md};
  margin-bottom: ${t('dark').space.md};
`;

const ChipContainer = styled.div<{ $mode: ThemeMode }>`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: ${t('dark').space.sm};
  padding: ${t('dark').space.sm};
  border: 2px solid ${p => t(p.$mode).action};
  border-radius: ${t('dark').radius.md};
  min-height: 44px;
  align-items: center;
`;

const Chip = styled.span<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.xs};
  padding: ${t('dark').space.xs} ${t('dark').space.sm};
  background: ${p => t(p.$mode).actionMuted};
  color: ${p => t(p.$mode).action};
  border-radius: ${t('dark').radius.full};
  font-size: ${t('dark').fontSize.sm};
`;

const ChipRemove = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: inherit;
  padding: 0;
  line-height: 1;
`;

const ChipInput = styled.input<{ $mode: ThemeMode }>`
  flex: 1;
  min-width: 100px;
  border: none;
  background: transparent;
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.base};
  
  &:focus {
    outline: none;
  }
`;

const RoleSelect = styled.select<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  background: ${p => t(p.$mode).canvas};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.base};
  cursor: pointer;
`;

const NotifyRow = styled.label<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.md};
  margin-bottom: ${t('dark').space.md};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.base};
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #6366f1;
`;

const MessageArea = styled.textarea<{ $mode: ThemeMode }>`
  width: 100%;
  padding: ${t('dark').space.md};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  background: ${p => t(p.$mode).canvas};
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.base};
  resize: none;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${p => t(p.$mode).action};
  }
  
  &::placeholder {
    color: ${p => t(p.$mode).inkFaint};
  }
`;

const Section = styled.div`
  margin-bottom: ${t('dark').space.lg};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${t('dark').space.md};
`;

const SectionTitle = styled.div<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.sm};
  font-weight: 500;
  color: ${p => t(p.$mode).inkMuted};
`;

const CopyEmailsBtn = styled.button<{ $mode: ThemeMode }>`
  background: none;
  border: none;
  color: ${p => t(p.$mode).inkMuted};
  cursor: pointer;
  padding: ${t('dark').space.xs};
  border-radius: ${t('dark').radius.sm};
  display: flex;
  align-items: center;
  transition: color ${t('dark').transition.fast};
  
  &:hover {
    color: ${p => t(p.$mode).ink};
  }
`;

const MemberList = styled.div``;

const MemberItem = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${t('dark').space.sm} 0;
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.md};
`;

const MemberDetails = styled.div``;

const MemberName = styled.div<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.base};
  color: ${p => t(p.$mode).ink};
`;

const MemberEmail = styled.div<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkMuted};
`;

const RoleLabel = styled.span<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.sm};
  color: ${p => t(p.$mode).inkMuted};
`;

const MemberRole = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  
  select {
    border: none;
    background: transparent;
    color: ${p => t(p.$mode).ink};
    font-size: ${t('dark').fontSize.sm};
    cursor: pointer;
  }
`;

const RemoveBtn = styled.button<{ $mode: ThemeMode }>`
  background: none;
  border: none;
  color: ${p => t(p.$mode).danger};
  font-size: 18px;
  cursor: pointer;
  padding: ${t('dark').space.xs};
  border-radius: ${t('dark').radius.sm};
  transition: background ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).dangerMuted};
  }
`;

const AccessWrapper = styled.div`
  position: relative;
`;

const AccessRow = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.md};
  padding: ${t('dark').space.sm};
  border-radius: ${t('dark').radius.md};
  cursor: pointer;
  transition: background ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).panel};
  }
`;

const AccessMenu = styled.div<{ $mode: ThemeMode }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.md};
  box-shadow: ${t('dark').shadow.lg};
  z-index: 1001;
  margin-top: ${t('dark').space.xs};
  overflow: hidden;
`;

const AccessMenuItem = styled.div<{ $mode: ThemeMode; $active?: boolean }>`
  padding: ${t('dark').space.md};
  cursor: pointer;
  color: ${p => t(p.$mode).ink};
  background: ${p => p.$active ? t(p.$mode).panel : 'transparent'};
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  transition: background ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).panel};
  }
`;

const CheckMark = styled.span<{ $visible: boolean }>`
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    display: ${p => p.$visible ? 'block' : 'none'};
    width: 10px;
    height: 6px;
    border-left: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(-45deg);
    margin-bottom: 2px;
  }
`;

const AccessIcon = styled.span<{ $mode: ThemeMode }>`
  font-size: 20px;
`;

const AccessInfo = styled.div`
  flex: 1;
`;

const AccessTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.xs};
`;

const AccessTitle = styled.div<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.base};
  color: ${p => t(p.$mode).ink};
`;

const AccessDesc = styled.div<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkMuted};
`;

const Chevron = styled.span<{ $mode: ThemeMode }>`
  font-size: 10px;
  color: ${p => t(p.$mode).inkMuted};
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${t('dark').space.lg};
  padding-top: ${t('dark').space.md};
  border-top: 1px solid ${t('dark').stroke};
`;

const FooterRight = styled.div`
  display: flex;
  gap: ${t('dark').space.md};
  align-items: center;
`;

const LinkBtn = styled.button<{ $mode: ThemeMode }>`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: ${t('dark').space.sm};
  border-radius: ${t('dark').radius.sm};
  transition: background ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).panel};
  }
`;

const LinkBtnText = styled.button<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  gap: ${t('dark').space.sm};
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  border: 1px solid ${p => t(p.$mode).action};
  border-radius: ${t('dark').radius.full};
  background: transparent;
  color: ${p => t(p.$mode).action};
  font-size: ${t('dark').fontSize.base};
  cursor: pointer;
  transition: background ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).actionMuted};
  }
`;

const CancelBtn = styled.button<{ $mode: ThemeMode }>`
  background: none;
  border: none;
  color: ${p => t(p.$mode).action};
  font-size: ${t('dark').fontSize.base};
  cursor: pointer;
  padding: ${t('dark').space.sm} ${t('dark').space.md};
  border-radius: ${t('dark').radius.sm};
  transition: background ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).actionMuted};
  }
`;

const SendBtn = styled.button<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.sm} ${t('dark').space.lg};
  background: ${p => t(p.$mode).action};
  color: white;
  border: none;
  border-radius: ${t('dark').radius.full};
  font-size: ${t('dark').fontSize.base};
  cursor: pointer;
  transition: background ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).actionHover};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DoneBtn = styled.button<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.sm} ${t('dark').space.lg};
  background: ${p => t(p.$mode).action};
  color: white;
  border: none;
  border-radius: ${t('dark').radius.full};
  font-size: ${t('dark').fontSize.base};
  cursor: pointer;
  transition: background ${t('dark').transition.fast};
  
  &:hover {
    background: ${p => t(p.$mode).actionHover};
  }
`;
