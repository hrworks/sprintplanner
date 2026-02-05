import styled from '@emotion/styled';
import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { getColors } from '@/styles';
import { api } from '@/api';
import { Button } from '@/components';

interface Board {
  id: string;
  name: string;
  data?: string;
  owner?: { name: string; email: string };
}

interface Project {
  _id: string;
  name: string;
  color?: string;
  phases: any[];
}

interface Props {
  onImport: (projects: Project[]) => void;
  onClose: () => void;
}

export const ImportBoardModal = ({ onImport, onClose }: Props) => {
  const { theme } = useStore();
  const [ownedBoards, setOwnedBoards] = useState<Board[]>([]);
  const [sharedBoards, setSharedBoards] = useState<Board[]>([]);
  const [expandedBoard, setExpandedBoard] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<Map<string, Project>>(new Map());
  const [boardProjects, setBoardProjects] = useState<Map<string, Project[]>>(new Map());

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    const data = await api.getBoards();
    setOwnedBoards(data.owned || []);
    setSharedBoards(data.shared || []);
  };

  const toggleBoard = async (board: Board) => {
    if (expandedBoard === board.id) {
      setExpandedBoard(null);
      return;
    }
    setExpandedBoard(board.id);
    
    if (!boardProjects.has(board.id)) {
      try {
        const fullBoard = await api.getBoard(board.id);
        const data = JSON.parse(fullBoard.data || '{"projects":[]}');
        setBoardProjects(prev => new Map(prev).set(board.id, data.projects || []));
      } catch {
        setBoardProjects(prev => new Map(prev).set(board.id, []));
      }
    }
  };

  const toggleProject = (project: Project) => {
    const newSelected = new Map(selectedProjects);
    if (newSelected.has(project._id)) {
      newSelected.delete(project._id);
    } else {
      newSelected.set(project._id, project);
    }
    setSelectedProjects(newSelected);
  };

  const handleImport = () => {
    const projects = Array.from(selectedProjects.values()).map(p => ({
      ...p,
      _id: `p-${Math.random().toString(36).slice(2, 8)}`,
      phases: p.phases.map(ph => ({ ...ph, _id: `ph-${Math.random().toString(36).slice(2, 8)}` }))
    }));
    onImport(projects);
    onClose();
  };

  const renderBoard = (board: Board) => (
    <BoardItem key={board.id}>
      <BoardHeader $mode={theme} onClick={() => toggleBoard(board)}>
        <Arrow $expanded={expandedBoard === board.id}>▶</Arrow>
        <span>{board.name}</span>
        {board.owner && <OwnerName $mode={theme}>{board.owner.name}</OwnerName>}
      </BoardHeader>
      {expandedBoard === board.id && (
        <ProjectList>
          {(boardProjects.get(board.id) || []).map(project => (
            <ProjectItem 
              key={project._id} 
              $mode={theme}
              $selected={selectedProjects.has(project._id)}
              onClick={() => toggleProject(project)}
            >
              <Checkbox type="checkbox" checked={selectedProjects.has(project._id)} readOnly />
              <span>{project.name}</span>
              <PhaseCount $mode={theme}>{project.phases.length} Phasen</PhaseCount>
            </ProjectItem>
          ))}
          {(boardProjects.get(board.id) || []).length === 0 && (
            <Empty $mode={theme}>Keine Projekte</Empty>
          )}
        </ProjectList>
      )}
    </BoardItem>
  );

  return (
    <Overlay onClick={onClose}>
      <Modal $mode={theme} onClick={e => e.stopPropagation()}>
        <Header $mode={theme}>
          <h3>Von anderem Board importieren</h3>
          <CloseBtn onClick={onClose}>×</CloseBtn>
        </Header>
        <Content>
          {ownedBoards.length === 0 && sharedBoards.length === 0 ? (
            <Empty $mode={theme}>Keine Boards verfügbar</Empty>
          ) : (
            <>
              {ownedBoards.length > 0 && (
                <Section>
                  <SectionTitle $mode={theme}>Meine Boards</SectionTitle>
                  {ownedBoards.map(renderBoard)}
                </Section>
              )}
              {sharedBoards.length > 0 && (
                <Section>
                  <SectionTitle $mode={theme}>Geteilte Boards</SectionTitle>
                  {sharedBoards.map(renderBoard)}
                </Section>
              )}
            </>
          )}
        </Content>
        <Footer>
          <Button $variant="secondary" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleImport} disabled={selectedProjects.size === 0}>
            {selectedProjects.size} Projekt(e) importieren
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const Modal = styled.div<{ $mode: string }>`
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgSecondary};
  border-radius: 12px;
  width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
`;

const Header = styled.div<{ $mode: string }>`
  padding: 16px 20px;
  border-bottom: 1px solid ${p => getColors(p.$mode as 'dark' | 'light').border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 { margin: 0; color: ${p => getColors(p.$mode as 'dark' | 'light').textPrimary}; }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  &:hover { opacity: 1; }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.div<{ $mode: string }>`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textSecondary};
  margin-bottom: 8px;
  padding-left: 4px;
`;

const BoardItem = styled.div`
  margin-bottom: 8px;
`;

const BoardHeader = styled.div<{ $mode: string }>`
  padding: 12px;
  background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textPrimary};
  &:hover { opacity: 0.9; }
  & > span:first-of-type { flex: 1; }
`;

const OwnerName = styled.span<{ $mode: string }>`
  font-size: 12px;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textSecondary};
`;

const Arrow = styled.span<{ $expanded: boolean }>`
  font-size: 10px;
  transition: transform 0.2s;
  transform: ${p => p.$expanded ? 'rotate(90deg)' : 'none'};
`;

const ProjectList = styled.div`
  padding: 8px 0 8px 24px;
`;

const ProjectItem = styled.div<{ $mode: string; $selected: boolean }>`
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${p => p.$selected ? getColors(p.$mode as 'dark' | 'light').accent + '22' : 'transparent'};
  color: ${p => getColors(p.$mode as 'dark' | 'light').textPrimary};
  &:hover { background: ${p => getColors(p.$mode as 'dark' | 'light').bgTertiary}; }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const PhaseCount = styled.span<{ $mode: string }>`
  margin-left: auto;
  font-size: 12px;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textSecondary};
`;

const Empty = styled.div<{ $mode: string }>`
  padding: 20px;
  text-align: center;
  color: ${p => getColors(p.$mode as 'dark' | 'light').textSecondary};
`;

const Footer = styled.div`
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;
