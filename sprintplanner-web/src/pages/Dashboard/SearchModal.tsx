import { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { t, ThemeMode } from '@/styles';
import { useStore } from '@/store';
import { api } from '@/api';
import { Board } from '@/api/types';
import type { BoardData } from '../GanttBoard/types';

interface SearchResult {
  type: 'board' | 'project' | 'phase';
  boardId: string;
  boardName: string;
  projectName?: string;
  phaseName?: string;
  name: string;
  matchField: string;
  matchText: string;
}

interface Props {
  onClose: () => void;
  onNavigate: (boardId: string) => void;
}

export const SearchModal = ({ onClose, onNavigate }: Props) => {
  const { theme } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [allData, setAllData] = useState<Board[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    loadAllBoards();
  }, []);

  const loadAllBoards = async () => {
    const data = await api.getBoards();
    setAllData([...(data.owned || []), ...(data.shared || []), ...(data.public || [])]);
  };

  const getExcerpt = (text: string, q: string, maxLen = 80) => {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text.slice(0, maxLen);
    const start = Math.max(0, idx - 30);
    const end = Math.min(text.length, idx + q.length + 50);
    let excerpt = text.slice(start, end);
    if (start > 0) excerpt = '...' + excerpt;
    if (end < text.length) excerpt = excerpt + '...';
    return excerpt;
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const found: SearchResult[] = [];

    for (const board of allData) {
      // Search board name/description
      if (board.name.toLowerCase().includes(q)) {
        found.push({ type: 'board', boardId: board.id, boardName: board.name, name: board.name, matchField: 'Name', matchText: board.name });
      } else if (board.description?.toLowerCase().includes(q)) {
        found.push({ type: 'board', boardId: board.id, boardName: board.name, name: board.name, matchField: 'Beschreibung', matchText: getExcerpt(board.description, q) });
      }

      // Search projects and phases
      if (board.data) {
        try {
          const data: BoardData = JSON.parse(board.data);
          for (const project of data.projects || []) {
            if (project.name.toLowerCase().includes(q)) {
              found.push({ type: 'project', boardId: board.id, boardName: board.name, projectName: project.name, name: project.name, matchField: 'Projekt', matchText: project.name });
            }
            for (const phase of project.phases || []) {
              if (phase.name.toLowerCase().includes(q)) {
                found.push({ type: 'phase', boardId: board.id, boardName: board.name, projectName: project.name, phaseName: phase.name, name: phase.name, matchField: 'Phase', matchText: phase.name });
              } else if (phase.description?.toLowerCase().includes(q)) {
                found.push({ type: 'phase', boardId: board.id, boardName: board.name, projectName: project.name, phaseName: phase.name, name: phase.name, matchField: 'Beschreibung', matchText: getExcerpt(phase.description, q) });
              }
            }
          }
        } catch {}
      }
    }
    setResults(found.slice(0, 20));
    setSelectedIndex(0);
  }, [query, allData]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      onNavigate(results[selectedIndex].boardId);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const highlight = (text: string, q: string) => {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <Highlight>{text.slice(idx, idx + q.length)}</Highlight>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const getIcon = (type: string) => {
    if (type === 'board') return '📋';
    if (type === 'project') return '📁';
    return '📅';
  };

  const getPath = (r: SearchResult) => {
    if (r.type === 'board') return '';
    if (r.type === 'project') return r.boardName;
    return `${r.boardName} / ${r.projectName}`;
  };

  return (
    <Overlay onClick={e => e.target === e.currentTarget && onClose()}>
      <Modal $mode={theme}>
        <SearchHeader $mode={theme}>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput
            ref={inputRef}
            $mode={theme}
            placeholder="Boards, Projekte oder Phasen suchen..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && <ClearBtn onClick={() => setQuery('')}>×</ClearBtn>}
        </SearchHeader>

        <Results $mode={theme}>
          {!query && <Hint $mode={theme}>Tippe um zu suchen...</Hint>}
          {query && results.length === 0 && <Hint $mode={theme}>Keine Ergebnisse für „{query}"</Hint>}
          {results.map((r, i) => (
            <ResultItem
              key={`${r.boardId}-${r.type}-${r.name}-${i}`}
              $mode={theme}
              $selected={i === selectedIndex}
              onClick={() => { onNavigate(r.boardId); onClose(); }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <ResultIcon>{getIcon(r.type)}</ResultIcon>
              <ResultContent>
                <ResultName $mode={theme}>{highlight(r.name, query)}</ResultName>
                {r.matchField === 'Beschreibung' && <ResultExcerpt $mode={theme}>{highlight(r.matchText, query)}</ResultExcerpt>}
                {getPath(r) && <ResultPath $mode={theme}>{getPath(r)}</ResultPath>}
              </ResultContent>
              <ResultType $mode={theme}>{r.type === 'board' ? 'Board' : r.type === 'project' ? 'Projekt' : 'Phase'}</ResultType>
            </ResultItem>
          ))}
        </Results>

        <Footer $mode={theme}>
          <Shortcut $mode={theme}>↑↓ Navigieren</Shortcut>
          <Shortcut $mode={theme}>↵ Öffnen</Shortcut>
          <Shortcut $mode={theme}>Esc Schließen</Shortcut>
        </Footer>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 1000;
`;

const Modal = styled.div<{ $mode: ThemeMode }>`
  background: ${p => t(p.$mode).board};
  border: 1px solid ${p => t(p.$mode).stroke};
  border-radius: ${t('dark').radius.lg};
  width: 600px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: ${t('dark').shadow.lg};
  overflow: hidden;
`;

const SearchHeader = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  align-items: center;
  padding: ${t('dark').space.md} ${t('dark').space.lg};
  border-bottom: 1px solid ${p => t(p.$mode).stroke};
  gap: ${t('dark').space.md};
`;

const SearchIcon = styled.span`
  font-size: 18px;
  opacity: 0.6;
`;

const SearchInput = styled.input<{ $mode: ThemeMode }>`
  flex: 1;
  background: none;
  border: none;
  color: ${p => t(p.$mode).ink};
  font-size: ${t('dark').fontSize.md};
  outline: none;
  
  &::placeholder { color: ${p => t(p.$mode).inkFaint}; }
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.5;
  &:hover { opacity: 1; }
`;

const Results = styled.div<{ $mode: ThemeMode }>`
  flex: 1;
  overflow-y: auto;
  padding: ${t('dark').space.sm} 0;
`;

const Hint = styled.div<{ $mode: ThemeMode }>`
  padding: ${t('dark').space.xl};
  text-align: center;
  color: ${p => t(p.$mode).inkMuted};
`;

const ResultItem = styled.div<{ $mode: ThemeMode; $selected: boolean }>`
  display: flex;
  align-items: center;
  padding: ${t('dark').space.sm} ${t('dark').space.lg};
  cursor: pointer;
  background: ${p => p.$selected ? t(p.$mode).actionMuted : 'transparent'};
  gap: ${t('dark').space.md};
  
  &:hover { background: ${p => t(p.$mode).actionMuted}; }
`;

const ResultIcon = styled.span`
  font-size: 18px;
`;

const ResultContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultName = styled.div<{ $mode: ThemeMode }>`
  font-weight: 500;
  color: ${p => t(p.$mode).ink};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultExcerpt = styled.div<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
`;

const ResultPath = styled.div<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultType = styled.span<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkFaint};
  padding: ${t('dark').space.xs} ${t('dark').space.sm};
  background: ${p => t(p.$mode).panel};
  border-radius: ${t('dark').radius.sm};
`;

const Highlight = styled.mark`
  background: rgba(251, 191, 36, 0.4);
  color: inherit;
  border-radius: 2px;
  padding: 0 2px;
`;

const Footer = styled.div<{ $mode: ThemeMode }>`
  display: flex;
  gap: ${t('dark').space.lg};
  padding: ${t('dark').space.sm} ${t('dark').space.lg};
  border-top: 1px solid ${p => t(p.$mode).stroke};
`;

const Shortcut = styled.span<{ $mode: ThemeMode }>`
  font-size: ${t('dark').fontSize.xs};
  color: ${p => t(p.$mode).inkFaint};
`;
