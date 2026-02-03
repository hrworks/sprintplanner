import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Modal, Button, Avatar } from '@/components';
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
  onClose: () => void;
}

export const ShareModal = ({ boardId, onClose }: Props) => {
  const { theme } = useStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [membersData, board] = await Promise.all([
      api.getMembers(boardId),
      api.getBoard(boardId)
    ]);
    setMembers(membersData);
    setIsPublic(board.isPublic || false);
  };

  const handleInvite = async () => {
    if (!email) return;
    await api.inviteMember(boardId, email, role);
    setEmail('');
    loadData();
  };

  const handleRemove = async (memberId: string) => {
    await api.removeMember(boardId, memberId);
    loadData();
  };

  const handleVisibilityChange = async (checked: boolean) => {
    setIsPublic(checked);
    await api.setVisibility(boardId, checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleInvite();
  };

  return (
    <Modal title="Board teilen" onClose={onClose} footer={
      <Button $variant="secondary" onClick={onClose}>Schließen</Button>
    }>
      <Section>
        <SectionTitle $mode={theme}>
          <span>🔗</span> Per Email einladen
        </SectionTitle>
        <InviteRow>
          <Input 
            $mode={theme} 
            type="email" 
            placeholder="email@example.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <RoleSelect $mode={theme} value={role} onChange={e => setRole(e.target.value)}>
            <option value="editor">✏️ Editor</option>
            <option value="viewer">👁️ Viewer</option>
          </RoleSelect>
          <Button $size="small" onClick={handleInvite}>Einladen</Button>
        </InviteRow>
      </Section>

      <Section>
        <VisibilityToggle $mode={theme} $active={isPublic}>
          <ToggleIcon>{isPublic ? '🌍' : '🔒'}</ToggleIcon>
          <ToggleContent>
            <ToggleTitle>{isPublic ? 'Öffentlich' : 'Privat'}</ToggleTitle>
            <ToggleDesc $mode={theme}>
              {isPublic ? 'Jeder mit dem Link kann dieses Board sehen' : 'Nur eingeladene Mitglieder haben Zugriff'}
            </ToggleDesc>
          </ToggleContent>
          <ToggleSwitch>
            <input type="checkbox" checked={isPublic} onChange={e => handleVisibilityChange(e.target.checked)} />
            <span />
          </ToggleSwitch>
        </VisibilityToggle>
      </Section>

      <Section>
        <SectionTitle $mode={theme}>
          <span>👥</span> Mitglieder ({members.length})
        </SectionTitle>
        <MemberList $mode={theme}>
          {members.length === 0 ? (
            <EmptyState $mode={theme}>
              <span>📭</span>
              <p>Noch keine Mitglieder eingeladen</p>
            </EmptyState>
          ) : (
            members.map(m => (
              <MemberItem key={m.id} $mode={theme}>
                <MemberInfo>
                  <Avatar name={m.user?.name || m.email} avatarUrl={m.user?.avatarUrl} size={36} />
                  <MemberDetails>
                    <MemberName $mode={theme}>{m.user?.name || m.email}</MemberName>
                    <MemberRole $mode={theme}>
                      {m.role === 'editor' ? '✏️ Editor' : '👁️ Viewer'}
                    </MemberRole>
                  </MemberDetails>
                </MemberInfo>
                <RemoveBtn onClick={() => handleRemove(m.id)} title="Entfernen">×</RemoveBtn>
              </MemberItem>
            ))
          )}
        </MemberList>
      </Section>
    </Modal>
  );
};

const Section = styled.div`
  margin-bottom: 20px;
  &:last-child { margin-bottom: 0; }
`;

const SectionTitle = styled.div<{ $mode: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: ${p => p.$mode === 'dark' ? '#fff' : '#333'};
  margin-bottom: 12px;
  span { font-size: 16px; }
`;

const InviteRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.input<{ $mode: string }>`
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid ${p => p.$mode === 'dark' ? '#444' : '#ddd'};
  background: ${p => p.$mode === 'dark' ? '#1a1a2e' : '#fff'};
  color: ${p => p.$mode === 'dark' ? '#fff' : '#000'};
  font-size: 14px;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #e94560;
  }
`;

const RoleSelect = styled.select<{ $mode: string }>`
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid ${p => p.$mode === 'dark' ? '#444' : '#ddd'};
  background: ${p => p.$mode === 'dark' ? '#1a1a2e' : '#fff'};
  color: ${p => p.$mode === 'dark' ? '#fff' : '#000'};
  font-size: 14px;
  cursor: pointer;
`;

const VisibilityToggle = styled.div<{ $mode: string; $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  background: ${p => p.$active 
    ? (p.$mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)')
    : (p.$mode === 'dark' ? '#1a1a2e' : '#f5f5f5')};
  border: 1px solid ${p => p.$active ? '#4caf50' : (p.$mode === 'dark' ? '#333' : '#ddd')};
  transition: all 0.2s;
`;

const ToggleIcon = styled.span`
  font-size: 24px;
`;

const ToggleContent = styled.div`
  flex: 1;
`;

const ToggleTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const ToggleDesc = styled.div<{ $mode: string }>`
  font-size: 12px;
  color: ${p => p.$mode === 'dark' ? '#888' : '#666'};
  margin-top: 2px;
`;

const ToggleSwitch = styled.label`
  position: relative;
  width: 48px;
  height: 26px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #444;
    border-radius: 26px;
    transition: 0.3s;
    
    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: 0.3s;
    }
  }
  
  input:checked + span {
    background: #4caf50;
  }
  
  input:checked + span:before {
    transform: translateX(22px);
  }
`;

const MemberList = styled.div<{ $mode: string }>`
  border-radius: 10px;
  border: 1px solid ${p => p.$mode === 'dark' ? '#333' : '#ddd'};
  overflow: hidden;
`;

const EmptyState = styled.div<{ $mode: string }>`
  padding: 30px;
  text-align: center;
  color: ${p => p.$mode === 'dark' ? '#666' : '#999'};
  
  span {
    font-size: 32px;
    display: block;
    margin-bottom: 8px;
  }
  
  p {
    margin: 0;
    font-size: 13px;
  }
`;

const MemberItem = styled.div<{ $mode: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: ${p => p.$mode === 'dark' ? '#1a1a2e' : '#fff'};
  border-bottom: 1px solid ${p => p.$mode === 'dark' ? '#333' : '#eee'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${p => p.$mode === 'dark' ? '#252540' : '#f9f9f9'};
  }
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MemberDetails = styled.div``;

const MemberName = styled.div<{ $mode: string }>`
  font-weight: 500;
  font-size: 14px;
  color: ${p => p.$mode === 'dark' ? '#fff' : '#333'};
`;

const MemberRole = styled.div<{ $mode: string }>`
  font-size: 12px;
  color: ${p => p.$mode === 'dark' ? '#888' : '#666'};
  margin-top: 2px;
`;

const RemoveBtn = styled.button`
  background: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #e74c3c;
    color: white;
  }
`;
