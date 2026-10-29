import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  MINION: 'minion',
  SHINCHAN: 'shinchan',
  CLINICAL: 'clinical',
};

const ThemeContext = createContext({
  theme: THEMES.MINION,
  isMinionTheme: true,
  isShinchanTheme: false,
  isClinicalTheme: false,
  setTheme: () => {},
  toggleTheme: () => {},
  toggleShinchanTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('gazescreen-active-theme');
      if (savedTheme && (savedTheme === THEMES.MINION || savedTheme === THEMES.SHINCHAN || savedTheme === THEMES.CLINICAL)) {
        return savedTheme;
      }
      // Check legacy setting
      const legacyShinchan = localStorage.getItem('gazescreen-shinchan-theme');
      if (legacyShinchan !== null) {
        return legacyShinchan === 'true' ? THEMES.SHINCHAN : THEMES.CLINICAL;
      }
      // Default to Minion theme as requested
      return THEMES.MINION;
    } catch {
      return THEMES.MINION;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gazescreen-active-theme', theme);
      localStorage.setItem('gazescreen-shinchan-theme', String(theme === THEMES.SHINCHAN));
    } catch {
      // Ignore storage errors in private browsing / sandboxes
    }

    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    // Clean up all theme classes
    root.classList.remove(
      'theme-minion',
      'theme-shinchan',
      'theme-clinical',
      'shinchan-theme-on',
      'shinchan-theme-off',
      'minion-theme-on',
      'minion-theme-off'
    );

    if (theme === THEMES.MINION) {
      root.classList.add('theme-minion', 'minion-theme-on', 'shinchan-theme-off');
    } else if (theme === THEMES.SHINCHAN) {
      root.classList.add('theme-shinchan', 'shinchan-theme-on', 'minion-theme-off');
    } else {
      root.classList.add('theme-clinical', 'shinchan-theme-off', 'minion-theme-off');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === THEMES.MINION) return THEMES.SHINCHAN;
      if (prev === THEMES.SHINCHAN) return THEMES.CLINICAL;
      return THEMES.MINION;
    });
  };

  const toggleShinchanTheme = () => {
    setTheme((prev) => (prev === THEMES.SHINCHAN ? THEMES.CLINICAL : THEMES.SHINCHAN));
  };

  const isMinionTheme = theme === THEMES.MINION;
  const isShinchanTheme = theme === THEMES.SHINCHAN;
  const isClinicalTheme = theme === THEMES.CLINICAL;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        toggleShinchanTheme,
        isMinionTheme,
        isShinchanTheme,
        isClinicalTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
