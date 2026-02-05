/**
 * Sprint Planner Design Tokens
 * 
 * Domänenspezifische Token-Namen aus der Welt von:
 * Timelines, Sprints, Phasen, Fortschritt, Planung
 */

export const tokens = {
  // === DARK MODE (Default) ===
  dark: {
    // Surfaces - wie Planungsflächen
    canvas: '#0f0f17',           // Haupthintergrund - die Planungstafel
    board: '#16161f',            // Erhöhte Fläche - Board-Cards
    panel: '#1e1e2a',            // Panels, Dropdowns, Modals
    
    // Text - Lesbarkeit auf dunklem Grund
    ink: '#e8e8ec',              // Primärtext
    inkMuted: '#8b8b9a',         // Sekundärtext, Meta-Info
    inkFaint: '#5a5a6a',         // Deaktiviert, Placeholder
    
    // Borders - subtile Struktur
    stroke: '#2a2a3a',           // Standard-Border
    strokeSubtle: '#222230',     // Sehr subtile Trennung
    
    // Sprint Status Colors
    sprintActive: '#22c55e',     // Grün - aktiv, on track
    sprintWarning: '#f59e0b',    // Amber - at risk
    sprintOverdue: '#ef4444',    // Rot - überfällig
    sprintComplete: '#6366f1',   // Indigo - abgeschlossen
    sprintPlanned: '#64748b',    // Slate - geplant, zukünftig
    
    // Accent - Hauptaktion
    action: '#6366f1',           // Primäre Aktionen
    actionHover: '#818cf8',      // Hover-State
    actionMuted: 'rgba(99, 102, 241, 0.15)', // Subtiler Hintergrund
    
    // Semantic
    danger: '#ef4444',
    dangerMuted: 'rgba(239, 68, 68, 0.15)',
    success: '#22c55e',
    successMuted: 'rgba(34, 197, 94, 0.15)',
  },
  
  // === LIGHT MODE ===
  light: {
    canvas: '#f8f9fb',
    board: '#ffffff',
    panel: '#ffffff',
    
    ink: '#1a1a2e',
    inkMuted: '#64748b',
    inkFaint: '#94a3b8',
    
    stroke: '#e2e8f0',
    strokeSubtle: '#f1f5f9',
    
    sprintActive: '#16a34a',
    sprintWarning: '#d97706',
    sprintOverdue: '#dc2626',
    sprintComplete: '#4f46e5',
    sprintPlanned: '#64748b',
    
    action: '#4f46e5',
    actionHover: '#6366f1',
    actionMuted: 'rgba(79, 70, 229, 0.1)',
    
    danger: '#dc2626',
    dangerMuted: 'rgba(220, 38, 38, 0.1)',
    success: '#16a34a',
    successMuted: 'rgba(22, 163, 74, 0.1)',
  },
  
  // === SPACING (8px Grid) ===
  space: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // === TYPOGRAPHY ===
  font: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  
  fontSize: {
    xs: '11px',
    sm: '13px',
    base: '14px',
    md: '16px',
    lg: '20px',
    xl: '24px',
  },
  
  // === RADII ===
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  
  // === TRANSITIONS ===
  transition: {
    fast: '120ms ease',
    base: '180ms ease',
  },
  
  // === SHADOWS ===
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
} as const;

export type Tokens = typeof tokens;
export type ThemeMode = 'dark' | 'light';

// Helper um Tokens für aktuellen Mode zu holen
export const t = (mode: ThemeMode) => ({
  ...tokens[mode],
  space: tokens.space,
  font: tokens.font,
  fontSize: tokens.fontSize,
  radius: tokens.radius,
  transition: tokens.transition,
  shadow: tokens.shadow,
});
