import { useState, useMemo, createContext, useEffect } from 'react';
import { createCustomTheme, ColorModeContext } from '../Theme';
import { Theme, ThemeProvider } from '@mui/material';

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('darkMode', newMode === 'dark' ? 'true' : 'false');
          return newMode;
        });
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(() => createCustomTheme(mode), [mode]);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode) {
      setMode(darkMode === 'true' ? 'dark' : 'light');
      localStorage.setItem('darkMode', darkMode);
    }
  }, []);

  return (
    <DarkModeContext.Provider value={{ mode, setMode, theme }}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </ColorModeContext.Provider>
    </DarkModeContext.Provider>
  );
}

interface ColorModeContextType {
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
  theme: Theme;
}

export const DarkModeContext = createContext<ColorModeContextType>({
  mode: 'dark',
  setMode: () => {
    // do nothing
  },
  theme: createCustomTheme('dark'),
});
