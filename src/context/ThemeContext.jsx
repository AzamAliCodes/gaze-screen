import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  isShinchanTheme: true,
  toggleShinchanTheme: () => {},
  setShinchanTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [isShinchanTheme, setIsShinchanTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('gazescreen-shinchan-theme');
      return saved !== null ? saved === 'true' : true; // Default ON as requested
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('gazescreen-shinchan-theme', String(isShinchanTheme));
    } catch {
      // Ignore storage errors in private browsing / sandboxes
    }
    const root = document.documentElement;
    if (isShinchanTheme) {
      root.classList.add('shinchan-theme-on');
      root.classList.remove('shinchan-theme-off');
      root.setAttribute('data-theme', 'shinchan');
    } else {
      root.classList.add('shinchan-theme-off');
      root.classList.remove('shinchan-theme-on');
      root.setAttribute('data-theme', 'clinical');
    }
  }, [isShinchanTheme]);

  const toggleShinchanTheme = () => setIsShinchanTheme((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isShinchanTheme, toggleShinchanTheme, setIsShinchanTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
