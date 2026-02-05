export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'pending' | 'active';
  createdAt?: string;
  owned?: number;
  editor?: number;
  viewer?: number;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  data?: string;
  role: 'owner' | 'editor' | 'viewer';
  isPublic?: boolean;
  allowedDomain?: string | null;
  updatedAt: string;
  members?: User[];
  owner?: { name: string; email: string; avatarUrl?: string };
}

export interface BoardMember {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: 'owner' | 'editor' | 'viewer';
}
