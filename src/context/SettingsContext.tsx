import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ThemeMode } from '../types/hexagram';
import { getJSON, setJSON, STORAGE_KEYS } from '../utils/storage';

interface SettingsContextValue {
  theme: ThemeMode;
  simplified: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleSimplified: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('xuanqing');
  const [simplified, setSimplifiedState] = useState<boolean>(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = getJSON<ThemeMode | null>(STORAGE_KEYS.THEME, null);
    if (savedTheme) {
      setThemeState(savedTheme);
    }

    const savedSimplified = getJSON<boolean | null>(STORAGE_KEYS.SIMPLIFIED, null);
    if (savedSimplified !== null) {
      setSimplifiedState(savedSimplified);
    }
  }, []);

  // Apply theme to document.documentElement
  useEffect(() => {
    if (theme === 'xuanqing') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    setJSON(STORAGE_KEYS.THEME, newTheme);
  }, []);

  const toggleSimplified = useCallback(() => {
    setSimplifiedState((prev) => {
      const newValue = !prev;
      setJSON(STORAGE_KEYS.SIMPLIFIED, newValue);
      return newValue;
    });
  }, []);

  const value: SettingsContextValue = {
    theme,
    simplified,
    setTheme,
    toggleSimplified,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
