export const theme = {
  colors: {
    bgPrimary: '#1a1a2e',
    bgSecondary: '#16213e',
    bgTertiary: '#0f3460',
    textPrimary: '#eee',
    textSecondary: '#888',
    accent: '#e94560',
    border: '#0f3460',
    danger: '#dc3545',
    success: '#4ade80',
    warning: '#fbbf24',
  },
  light: {
    bgPrimary: '#f5f5f5',
    bgSecondary: '#ffffff',
    bgTertiary: '#e8e8e8',
    textPrimary: '#333',
    textSecondary: '#666',
    border: '#ddd',
  },
} as const;

export type Theme = typeof theme;
export type ThemeMode = 'dark' | 'light';
