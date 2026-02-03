import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/api/types';
import { ThemeMode } from '@/styles';

interface AppState {
  user: User | null;
  theme: ThemeMode;
  setUser: (user: User | null) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: (localStorage.getItem('theme') as ThemeMode) || 'dark',
      setUser: (user) => set({ user }),
      setTheme: (theme) => {
        localStorage.setItem('theme', theme);
        set({ theme });
      },
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        return { theme: newTheme };
      }),
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null });
      },
    }),
    { name: 'app-store', partialize: (state) => ({ theme: state.theme }) }
  )
);
