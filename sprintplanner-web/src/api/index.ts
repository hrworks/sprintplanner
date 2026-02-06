import { User, Board } from './types';

const getToken = () => localStorage.getItem('token');

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  getMe: () => fetchApi<User>('/api/me'),
  
  // Boards
  getBoards: () => fetchApi<{ owned: Board[]; shared: Board[]; public: Board[] }>('/api/boards'),
  getBoard: (id: string) => fetchApi<Board>(`/api/boards/${id}`),
  createBoard: (name: string, description?: string, data?: string) => 
    fetchApi<Board>('/api/boards', { method: 'POST', body: JSON.stringify({ name, description, data }) }),
  updateBoard: (id: string, data: Partial<Board>) => 
    fetchApi<Board>(`/api/boards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  sendAction: (boardId: string, action: any, clientId: string) =>
    fetchApi<void>(`/api/boards/${boardId}/actions`, { method: 'POST', body: JSON.stringify({ action, clientId }) }),
  deleteBoard: (id: string) => 
    fetchApi<void>(`/api/boards/${id}`, { method: 'DELETE' }),
  setVisibility: (id: string, isPublic: boolean) =>
    fetchApi<Board>(`/api/boards/${id}`, { method: 'PUT', body: JSON.stringify({ isPublic }) }),
  
  // Board Members
  getMembers: (boardId: string) => fetchApi<{ id: string; email: string; role: string; user?: { name: string } }[]>(`/api/boards/${boardId}/members`),
  inviteMember: (boardId: string, email: string, role: string, message?: string) =>
    fetchApi<void>(`/api/boards/${boardId}/members`, { method: 'POST', body: JSON.stringify({ email, role, message }) }),
  updateMemberRole: (boardId: string, memberId: string, role: string) =>
    fetchApi<void>(`/api/boards/${boardId}/members/${memberId}`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  removeMember: (boardId: string, memberId: string) =>
    fetchApi<void>(`/api/boards/${boardId}/members/${memberId}`, { method: 'DELETE' }),
  
  // Users (admin)
  getUsers: () => fetchApi<User[]>('/api/users'),
  getUserBoards: (userId: string) => fetchApi<{ id: string; name: string; description?: string; data?: string; isPublic?: boolean; updatedAt: string; members: { id: string; name?: string; email: string; avatarUrl?: string; role: string }[] }[]>(`/api/users/${userId}/boards`),
  inviteUser: (email: string) => 
    fetchApi<User>('/api/users/invite', { method: 'POST', body: JSON.stringify({ email }) }),
  deleteUser: (id: string) => 
    fetchApi<void>(`/api/users/${id}`, { method: 'DELETE' }),
  updateUserRole: (id: string, role: 'admin' | 'user' | 'viewer') => 
    fetchApi<User>(`/api/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
};

export const auth = {
  getToken,
  setToken: (token: string) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  isAuthenticated: () => !!getToken(),
};
