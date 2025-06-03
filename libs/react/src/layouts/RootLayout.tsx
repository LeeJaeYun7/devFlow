import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';

const sidebarWidth = 280;

interface RootLayoutProps {
  topbar?: React.ReactNode;
  sidebar?: React.ReactNode;
  requireLogin?: boolean;
}

export function RootLayout({ topbar, sidebar }: RootLayoutProps) {
  const theme = useTheme();
  const isNotMobile = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ marginLeft: isNotMobile ? `${sidebarWidth - 24}px` : 0 }}>{topbar}</Box>
      <Box sx={{ display: 'flex', flex: 1 }}>
        {sidebar}

        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            marginLeft: isNotMobile ? `${sidebarWidth}px` : 0,
            gap: 3,
          }}
        >
          <Box
            sx={{
              flex: 1,
              width: '100%',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
