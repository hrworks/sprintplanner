export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
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
  updatedAt: string;
  members?: User[];
}

export interface BoardMember {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: 'owner' | 'editor' | 'viewer';
}
