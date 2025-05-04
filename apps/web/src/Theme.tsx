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
        main: '#4A6FFF', // AI를 상징하는 밝은 블루
        light: '#6B89FF',
        dark: '#3557DB',
      },
      secondary: {
        main: '#38B2AC', // 금융을 상징하는 청록색
        light: '#4DC4BE',
        dark: '#2C8F8A',
      },
      background: {
        default: mode === 'dark' ? '#1A1B1E' : '#F4F6F8',
        paper: mode === 'dark' ? '#242529' : '#FFFFFF',
      },
      text: {
        primary: mode === 'dark' ? '#E6E8ED' : '#2D3748',
        secondary: mode === 'dark' ? '#A0AEC0' : '#718096',
      },
    },
    typography: {
      fontFamily: '"Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
      h1: {
        fontSize: '2rem',
        sm: '2.5rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '1.75rem',
        sm: '2rem',
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.5rem',
        sm: '1.75rem',
        fontWeight: 600,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.7,
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
            width: '250px',
            xs: '85%',
            backgroundColor: mode === 'dark' ? '#242529' : '#FFFFFF',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#242529' : '#FFFFFF',
            color: mode === 'dark' ? '#E6E8ED' : '#2D3748',
            boxShadow: mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
            backdropFilter: 'blur(8px)',
            '& .MuiToolbar-root': {
              minHeight: { xs: '56px', sm: '64px' },
              padding: { xs: '0 16px', sm: '0 24px' },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
            fontWeight: 600,
            padding: '10px 20px',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(74,111,255,0.2)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
            border: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            margin: '4px 8px',
            padding: '10px 16px',
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(74,111,255,0.04)',
            },
            '&.Mui-selected': {
              backgroundColor: mode === 'dark' ? 'rgba(74,111,255,0.15)' : 'rgba(74,111,255,0.08)',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(74,111,255,0.2)' : 'rgba(74,111,255,0.12)',
              },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 36,
            color: mode === 'dark' ? '#A0AEC0' : '#718096',
          },
        },
      },
      MuiListSubheader: {
        styleOverrides: {
          root: {
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            color: mode === 'dark' ? '#A0AEC0' : '#718096',
            lineHeight: '36px',
            backgroundColor: 'transparent',
          },
        },
      },
    },
  });
