import { css, Global } from '@emotion/react';
import { theme, ThemeMode } from './theme';

const getColors = (mode: ThemeMode) => {
  const base = theme.colors;
  const light = theme.light;
  return mode === 'light' 
    ? { ...base, ...light }
    : base;
};

export const GlobalStyles = ({ mode }: { mode: ThemeMode }) => {
  const colors = getColors(mode);
  
  return (
    <Global
      styles={css`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', sans-serif;
          background: ${colors.bgPrimary};
          color: ${colors.textPrimary};
          min-height: 100vh;
          transition: background 0.3s, color 0.3s;
        }
        a {
          color: inherit;
          text-decoration: none;
        }
      `}
    />
  );
};

export { getColors };
