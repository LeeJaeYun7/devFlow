import { createTheme, PaletteMode } from '@mui/material/styles';
import { createContext } from 'react';

export const ColorModeContext = createContext({
  toggleColorMode: () => {
    // pass
  },
  mode: 'light' as PaletteMode,
});

export const createCustomTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#0066FF', // 더 선명한 파란색으로 변경
        light: '#3384FF',
        dark: '#0047B3',
      },
      secondary: {
        main: '#00C2FF', // 밝은 하늘색으로 변경
        light: '#33CFFF',
        dark: '#0099CC',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#FFFFFF',
        paper: mode === 'dark' ? '#1E1E1E' : '#F8F9FA',
      },
      text: {
        primary: mode === 'dark' ? '#FFFFFF' : '#1A1A1A',
        secondary: mode === 'dark' ? '#B3B3B3' : '#6C757D',
      },
    },
    typography: {
      fontFamily: '"Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        letterSpacing: '0.00938em',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            width: '280px',
            backgroundColor: mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
            boxShadow: mode === 'dark' ? '4px 0 8px rgba(0,0,0,0.2)' : '4px 0 8px rgba(0,0,0,0.05)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
            color: mode === 'dark' ? '#FFFFFF' : '#1A1A1A',
            boxShadow: 'none',
            borderBottom: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            '& .MuiToolbar-root': {
              minHeight: '64px',
              padding: '0 24px',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
            padding: '8px 16px',
          },
          contained: {
            boxShadow: 'none',
            backgroundColor: mode === 'dark' ? '#1886FE' : '#1C1C1C',
            color: mode === 'dark' ? '#FFFFFF' : '#FFFFFF',
            '&:hover': {
              backgroundColor: mode === 'dark' ? '#1575E5' : '#000000',
              boxShadow: '0 2px 8px rgba(0,102,255,0.25)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
            border: 'none',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,102,255,0.08)',
            },
            '&.Mui-selected': {
              backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 102, 255, 0.12)',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 102, 255, 0.16)',
              },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 32,
            color: mode === 'dark' ? '#B3B3B3' : '#6C757D',
          },
        },
      },
      MuiListSubheader: {
        styleOverrides: {
          root: {
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: mode === 'dark' ? '#B3B3B3' : '#6C757D',
            lineHeight: '32px',
            backgroundColor: 'transparent',
          },
        },
      },
    },
  });
