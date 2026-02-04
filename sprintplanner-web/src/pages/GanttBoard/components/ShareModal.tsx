import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Avatar } from '@/components';
import { useStore } from '@/store';
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
    // Determine access mode
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
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/gantt/${boardId}`);
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
            <InputRow $mode={theme}>
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
                <SendBtn onClick={handleSend} disabled={pendingInvites.length === 0}>Senden</SendBtn>
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
            />

            <Section>
              <SectionTitle $mode={theme}>Personen mit Zugriff</SectionTitle>
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
                      <select value={m.role} onChange={() => {}}>
                        <option value="editor">Mitbearbeiter</option>
                        <option value="viewer">Betrachter</option>
                      </select>
                      <RemoveBtn onClick={() => handleRemove(m.id)}>×</RemoveBtn>
                    </MemberRole>
                  </MemberItem>
                ))}
              </MemberList>
            </Section>

            <Section>
              <SectionTitle $mode={theme}>Allgemeiner Zugriff</SectionTitle>
              <AccessWrapper>
                <AccessRow $mode={theme} onClick={() => setShowAccessMenu(!showAccessMenu)}>
                  <AccessIcon>{accessMode === 'public' ? '🌍' : '🔒'}</AccessIcon>
                  <AccessInfo>
                    <AccessTitleRow>
                      <AccessTitle $mode={theme}>
                        {accessMode === 'restricted' && 'Eingeschränkt'}
                        {accessMode === 'domain' && (allowedDomain?.split('.')[0]?.toUpperCase() || 'Domain')}
                        {accessMode === 'public' && 'Jeder, der über den Link verfügt'}
                      </AccessTitle>
                      <Chevron $mode={theme}>▼</Chevron>
                    </AccessTitleRow>
                    <AccessDesc $mode={theme}>
                      {accessMode === 'restricted' && 'Nur Personen mit Zugriff können den Link öffnen'}
                      {accessMode === 'domain' && `Jeder bei ${allowedDomain} kann dieses Board sehen`}
                      {accessMode === 'public' && 'Jeder mit dem Link kann dieses Board sehen'}
                    </AccessDesc>
                  </AccessInfo>
                </AccessRow>
                {showAccessMenu && (
                  <AccessMenu $mode={theme}>
                    <AccessMenuItem $mode={theme} $active={accessMode === 'restricted'} onClick={() => handleAccessChange('restricted')}>
                      {accessMode === 'restricted' && '✓ '}Eingeschränkt
                    </AccessMenuItem>
                    {ownerDomain && (
                      <AccessMenuItem $mode={theme} $active={accessMode === 'domain'} onClick={() => handleAccessChange('domain')}>
                        {accessMode === 'domain' && '✓ '}{ownerDomain.split('.')[0].toUpperCase()}
                      </AccessMenuItem>
                    )}
                    <AccessMenuItem $mode={theme} $active={accessMode === 'public'} onClick={() => handleAccessChange('public')}>
                      {accessMode === 'public' && '✓ '}Jeder, der über den Link verfügt
                    </AccessMenuItem>
                  </AccessMenu>
                )}
              </AccessWrapper>
            </Section>

            <Footer>
              <LinkBtnText $mode={theme} onClick={copyLink}>
                🔗 Link kopieren
              </LinkBtnText>
              <DoneBtn onClick={onClose}>Fertig</DoneBtn>
            </Footer>
          </>
        )}
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div<{ $mode: string }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div<{ $mode: string }>`
  background: ${p => p.$mode === 'dark' ? '#202124' : '#fff'};
  border-radius: 8px;
  width: 512px;
  max-height: 90vh;
  overflow-y: visible;
  padding: 20px 24px;
`;

const Header = styled.div<{ $mode: string }>`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const BackBtn = styled.button<{ $mode: string }>`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#202124'};
  padding: 4px 8px;
  &:hover { background: ${p => p.$mode === 'dark' ? '#3c4043' : '#f1f3f4'}; border-radius: 4px; }
`;

const Title = styled.h2<{ $mode: string }>`
  font-size: 22px;
  font-weight: 400;
  color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#202124'};
  margin: 0;
`;

const EmailInput = styled.input<{ $mode: string }>`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${p => p.$mode === 'dark' ? '#5f6368' : '#dadce0'};
  border-radius: 8px;
  background: transparent;
  color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#202124'};
  font-size: 14px;
  margin-bottom: 20px;
  box-sizing: border-box;
  &:focus { outline: none; border-color: #1a73e8; }
  &::placeholder { color: ${p => p.$mode === 'dark' ? '#9aa0a6' : '#5f6368'}; }
`;

const InputRow = styled.div<{ $mode: string }>`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const ChipContainer = styled.div<{ $mode: string }>`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  border: 2px solid #1a73e8;
  border-radius: 8px;
  min-height: 44px;
  align-items: center;
`;

const Chip = styled.span<{ $mode: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${p => p.$mode === 'dark' ? '#3c4043' : '#e8f0fe'};
  color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#1967d2'};
  border-radius: 16px;
  font-size: 13px;
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

const ChipInput = styled.input<{ $mode: string }>`
  flex: 1;
  min-width: 100px;
  border: none;
  background: transparent;
  color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#202124'};
  font-size: 14px;
  &:focus { outline: none; }
`;

const RoleSelect = styled.select<{ $mode: string }>`
  padding: 8px 12px;
  border: 1px solid ${p => p.$mode === 'dark' ? '#5f6368' : '#dadce0'};
  border-radius: 4px;
  background: ${p => p.$mode === 'dark' ? '#202124' : '#fff'};
  color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#202124'};
  font-size: 14px;
  cursor: pointer;
`;

const NotifyRow = styled.label<{ $mode: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#202124'};
  font-size: 14px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #1a73e8;
`;

const MessageArea = styled.textarea<{ $mode: string }>`
  width: 100%;
  padding: 12px;
  border: 1px solid ${p => p.$mode === 'dark' ? '#5f6368' : '#dadce0'};
  border-radius: 8px;
  background: transparent;
  color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#202124'};
  font-size: 14px;
  resize: none;
  box-sizing: border-box;
  &:focus { outline: none; border-color: #1a73e8; }
  &::placeholder { color: ${p => p.$mode === 'dark' ? '#9aa0a6' : '#5f6368'}; }
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.div<{ $mode: string }>`
  font-size: 14px;
  color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#202124'};
  margin-bottom: 12px;
`;

const MemberList = styled.div``;

const MemberItem = styled.div<{ $mode: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MemberDetails = styled.div``;

const MemberName = styled.div<{ $mode: string }>`
  font-size: 14px;
  color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#202124'};
`;

const MemberEmail = styled.div<{ $mode: string }>`
  font-size: 12px;
  color: ${p => p.$mode === 'dark' ? '#9aa0a6' : '#5f6368'};
`;

const RoleLabel = styled.span<{ $mode: string }>`
  font-size: 14px;
  color: ${p => p.$mode === 'dark' ? '#9aa0a6' : '#5f6368'};
`;

const MemberRole = styled.div<{ $mode: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  
  select {
    border: none;
    background: transparent;
    color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#202124'};
    font-size: 14px;
    cursor: pointer;
    
    option {
      background: ${p => p.$mode === 'dark' ? '#2d2d2d' : '#fff'};
      color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#202124'};
    }
  }
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: #ea4335;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  &:hover { background: rgba(234, 67, 53, 0.1); border-radius: 4px; }
`;

const AccessRow = styled.div<{ $mode: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  &:hover { background: ${p => p.$mode === 'dark' ? '#3c4043' : '#f1f3f4'}; }
`;

const AccessWrapper = styled.div`
  position: relative;
`;

const AccessMenu = styled.div<{ $mode: string }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${p => p.$mode === 'dark' ? '#303134' : '#fff'};
  border: 1px solid ${p => p.$mode === 'dark' ? '#5f6368' : '#dadce0'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1001;
  margin-top: 4px;
  overflow: hidden;
`;

const AccessMenuItem = styled.div<{ $mode: string; $active?: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#202124'};
  background: ${p => p.$active ? (p.$mode === 'dark' ? '#3c4043' : '#f1f3f4') : 'transparent'};
  &:hover { background: ${p => p.$mode === 'dark' ? '#3c4043' : '#f1f3f4'}; }
`;

const AccessIcon = styled.span`
  font-size: 20px;
`;

const AccessInfo = styled.div`
  flex: 1;
`;

const AccessTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AccessTitle = styled.div<{ $mode: string }>`
  font-size: 14px;
  color: ${p => p.$mode === 'dark' ? '#e8eaed' : '#202124'};
`;

const AccessDesc = styled.div<{ $mode: string }>`
  font-size: 12px;
  color: ${p => p.$mode === 'dark' ? '#9aa0a6' : '#5f6368'};
`;

const Chevron = styled.span<{ $mode: string }>`
  font-size: 10px;
  color: ${p => p.$mode === 'dark' ? '#9aa0a6' : '#5f6368'};
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 16px;
`;

const FooterRight = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const LinkBtn = styled.button<{ $mode: string }>`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  &:hover { background: ${p => p.$mode === 'dark' ? '#3c4043' : '#f1f3f4'}; border-radius: 4px; }
`;

const LinkBtnText = styled.button<{ $mode: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid ${p => p.$mode === 'dark' ? '#8ab4f8' : '#1a73e8'};
  border-radius: 20px;
  background: transparent;
  color: ${p => p.$mode === 'dark' ? '#8ab4f8' : '#1a73e8'};
  font-size: 14px;
  cursor: pointer;
  &:hover { background: ${p => p.$mode === 'dark' ? 'rgba(138, 180, 248, 0.1)' : 'rgba(26, 115, 232, 0.1)'}; }
`;

const CancelBtn = styled.button<{ $mode: string }>`
  background: none;
  border: none;
  color: #1a73e8;
  font-size: 14px;
  cursor: pointer;
  padding: 10px 16px;
  &:hover { background: rgba(26, 115, 232, 0.1); border-radius: 4px; }
`;

const SendBtn = styled.button`
  padding: 10px 24px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  &:hover { background: #1557b0; }
  &:disabled { background: #8ab4f8; cursor: not-allowed; }
`;

const DoneBtn = styled.button`
  padding: 10px 24px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  &:hover { background: #1557b0; }
`;
