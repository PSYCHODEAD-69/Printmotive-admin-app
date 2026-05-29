import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'pm_theme';

export const darkTheme = {
  mode: 'dark',
  bg: '#0a0a0a',
  surface: '#141414',
  surface2: '#1c1c1c',
  border: '#2a2a2a',
  text: '#f0f0f0',
  textSecondary: '#aaaaaa',
  muted: '#888888',
  accent: '#ff4d2e',
  accent2: '#ff6b4e',
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#f5a623',
  white: '#ffffff',
  cardBg: '#141414',
  inputBg: '#0a0a0a',
  modalBg: '#141414',
};

export const lightTheme = {
  mode: 'light',
  bg: '#f5f5f0',
  surface: '#ffffff',
  surface2: '#f0f0eb',
  border: '#e0e0d8',
  text: '#0a0a0a',
  textSecondary: '#444444',
  muted: '#888888',
  accent: '#ff4d2e',
  accent2: '#ff6b4e',
  green: '#16a34a',
  red: '#dc2626',
  yellow: '#d97706',
  white: '#ffffff',
  cardBg: '#ffffff',
  inputBg: '#f5f5f0',
  modalBg: '#ffffff',
};

const ThemeContext = createContext({
  theme: darkTheme,
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(THEME_KEY).then(val => {
      if (val !== null) setIsDark(val === 'dark');
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await SecureStore.setItemAsync(THEME_KEY, next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme: isDark ? darkTheme : lightTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
