import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  colors: {}
});

function getInitialTheme() {
  try {
    const saved = window.localStorage.getItem('earthpulse-terra-theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch {
    // Ignore storage access errors in restricted sandboxes
  }
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch {
    // Ignore matchMedia errors
  }
  return 'dark';
}

function readThemeVariables(themeName) {
  if (typeof window === 'undefined' || !document.documentElement) {
    return themeName === 'dark'
      ? {
          bg: '#12150f',
          panel: '#171b13',
          card: '#1e2318',
          border: '#323a28',
          text: '#f2ecdc',
          muted: '#a7a28d',
          accent: '#d9b64c',
          accentFg: '#12150f',
          warm: '#e8643a',
          cool: '#3fa7a0',
          sig: '#9cc45a',
          warn: '#e09f3e',
          changepoint: '#d6455d',
          neutralCell: '#30382a',
          sea: '#0e120c',
          grid: '#272d20',
          obs: 'rgba(242, 236, 220, 0.32)',
          rolling: '#f2ecdc',
          ciFill: 'rgba(217, 182, 76, 0.14)'
        }
      : {
          bg: '#f6f4ef',
          panel: '#ffffff',
          card: '#ffffff',
          border: '#dcd8cf',
          text: '#17212b',
          muted: '#5f6b78',
          accent: '#9a6b0b',
          accentFg: '#ffffff',
          warm: '#d9480f',
          cool: '#1f8a84',
          sig: '#4d7a1f',
          warn: '#b45309',
          changepoint: '#d6455d',
          neutralCell: '#ebe8dd',
          sea: '#e3e9e5',
          grid: '#e5e1d7',
          obs: 'rgba(23, 33, 43, 0.35)',
          rolling: '#17212b',
          ciFill: 'rgba(154, 107, 11, 0.12)'
        };
  }

  const cs = window.getComputedStyle(document.documentElement);
  const v = (name, fallback) => cs.getPropertyValue(name)?.trim() || fallback;

  return {
    bg: v('--bg', themeName === 'dark' ? '#12150f' : '#f6f4ef'),
    panel: v('--panel', themeName === 'dark' ? '#171b13' : '#ffffff'),
    card: v('--card', themeName === 'dark' ? '#1e2318' : '#ffffff'),
    border: v('--border', themeName === 'dark' ? '#323a28' : '#dcd8cf'),
    text: v('--text', themeName === 'dark' ? '#f2ecdc' : '#17212b'),
    muted: v('--muted', themeName === 'dark' ? '#a7a28d' : '#5f6b78'),
    accent: v('--accent', themeName === 'dark' ? '#d9b64c' : '#9a6b0b'),
    accentFg: v('--accent-fg', themeName === 'dark' ? '#12150f' : '#ffffff'),
    warm: v('--warm', themeName === 'dark' ? '#e8643a' : '#d9480f'),
    cool: v('--cool', themeName === 'dark' ? '#3fa7a0' : '#1f8a84'),
    sig: v('--sig', themeName === 'dark' ? '#9cc45a' : '#4d7a1f'),
    warn: v('--warn', themeName === 'dark' ? '#e09f3e' : '#b45309'),
    changepoint: v('--changepoint', '#d6455d'),
    neutralCell: v('--neutral-cell', themeName === 'dark' ? '#30382a' : '#ebe8dd'),
    sea: v('--sea', themeName === 'dark' ? '#0e120c' : '#e3e9e5'),
    grid: v('--grid', themeName === 'dark' ? '#272d20' : '#e5e1d7'),
    obs: v('--chart-obs', themeName === 'dark' ? 'rgba(242, 236, 220, 0.32)' : 'rgba(23, 33, 43, 0.35)'),
    rolling: v('--chart-rolling', themeName === 'dark' ? '#f2ecdc' : '#17212b'),
    ciFill: v('--chart-ci-fill', themeName === 'dark' ? 'rgba(217, 182, 76, 0.14)' : 'rgba(154, 107, 11, 0.12)')
  };
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [colors, setColors] = useState(() => readThemeVariables(getInitialTheme()));

  const applyTheme = useCallback((nextTheme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('earthpulse-terra-theme', nextTheme);
    } catch {
      // Ignore storage write errors
    }
    // Re-read computed CSS variables on next animation frame after data-theme flips
    requestAnimationFrame(() => {
      setColors(readThemeVariables(nextTheme));
    });
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback((nextTheme) => {
    if (nextTheme === 'dark' || nextTheme === 'light') {
      setThemeState(nextTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, colors }),
    [theme, setTheme, toggleTheme, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
