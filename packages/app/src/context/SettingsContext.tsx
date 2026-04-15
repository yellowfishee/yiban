import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { storage, STORAGE_KEYS } from '../adapters/storage';

export type ThemeMode = 'xuanqing' | 'dailan' | 'mojin';
export type FontSize = 'small' | 'medium' | 'large';

interface SettingsContextValue {
  theme: ThemeMode;
  simplified: boolean;
  devMode: boolean;
  fontSize: FontSize;
  setTheme: (theme: ThemeMode) => void;
  toggleSimplified: () => void;
  toggleDevMode: () => void;
  setFontSize: (size: FontSize) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('xuanqing');
  const [simplified, setSimplifiedState] = useState<boolean>(false);
  const [devMode, setDevModeState] = useState<boolean>(false);
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');

  // 从存储加载设置
  useEffect(() => {
    const savedTheme = storage.get<ThemeMode>(STORAGE_KEYS.THEME);
    if (savedTheme) {
      setThemeState(savedTheme);
    }

    const savedSimplified = storage.get<boolean>(STORAGE_KEYS.SIMPLIFIED);
    if (savedSimplified !== null && savedSimplified !== undefined) {
      setSimplifiedState(savedSimplified);
    }

    const savedDevMode = storage.get<boolean>(STORAGE_KEYS.DEVMODE);
    if (savedDevMode !== null && savedDevMode !== undefined) {
      setDevModeState(savedDevMode);
    }

    const savedFontSize = storage.get<FontSize>(STORAGE_KEYS.FONT_SIZE);
    if (savedFontSize) {
      setFontSizeState(savedFontSize);
    }
  }, []);

  // 应用主题 - H5和小程序有不同的实现方式
  useEffect(() => {
    const env = Taro.getEnv();
    if (env === Taro.ENV_TYPE.WEB) {
      // H5: 使用CSS变量
      if (theme === 'xuanqing') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }
    // 小程序: 主题样式在全局CSS中定义，通过data-theme属性控制
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    storage.set(STORAGE_KEYS.THEME, newTheme);
  }, []);

  const toggleSimplified = useCallback(() => {
    setSimplifiedState((prev) => {
      const newValue = !prev;
      storage.set(STORAGE_KEYS.SIMPLIFIED, newValue);
      return newValue;
    });
  }, []);

  const toggleDevMode = useCallback(() => {
    setDevModeState((prev) => {
      const newValue = !prev;
      storage.set(STORAGE_KEYS.DEVMODE, newValue);
      return newValue;
    });
  }, []);

  const setFontSize = useCallback((newSize: FontSize) => {
    setFontSizeState(newSize);
    storage.set(STORAGE_KEYS.FONT_SIZE, newSize);
  }, []);

  const value: SettingsContextValue = {
    theme,
    simplified,
    devMode,
    fontSize,
    setTheme,
    toggleSimplified,
    toggleDevMode,
    setFontSize,
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
