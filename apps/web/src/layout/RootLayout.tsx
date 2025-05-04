import { Box, Fab, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useContext } from 'react';
import { ColorModeContext } from '../Theme';
import { Outlet } from 'react-router-dom';
import { WbSunny, NightsStay } from '@mui/icons-material';

const sidebarWidth = 250;

interface RootLayoutProps {
  sidebar?: React.ReactNode;
}

export function RootLayout({ sidebar }: RootLayoutProps) {
  const theme = useTheme();
  const isNotMobile = useMediaQuery(theme.breakpoints.up('sm'));
  const colorMode = useContext(ColorModeContext);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* 메인 컨텐츠 영역 */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {sidebar}

        <Box
          sx={{
            flex: 1,
            p: { xs: 1, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            marginLeft: isNotMobile ? `${sidebarWidth}px` : 0,
            marginTop: isNotMobile ? 0 : `48px`,
          }}
        >
          <Box sx={{ flex: 1, p: { xs: 1, sm: 2 }, width: '100%' }}>
            <Outlet />
          </Box>
          <RootFooter />
        </Box>
      </Box>
      {/* 다크모드 토글 플로팅 버튼 */}
      <Fab
        color="primary"
        size="small"
        sx={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 2000,
        }}
        onClick={colorMode.toggleColorMode}
      >
        {theme.palette.mode === 'dark' ? (
          <WbSunny sx={{ fontSize: '1.2rem' }} />
        ) : (
          <NightsStay sx={{ fontSize: '1.2rem' }} />
        )}
      </Fab>
    </Box>
  );
}

function RootFooter() {
  return (
    <Box
      component="footer"
      sx={{
        py: 0.3,
        px: 1,
        bgcolor: 'background.default',
        textAlign: 'center',
        marginTop: '8px',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        © 2024 개인정보 처리방침 | All rights reserved.
      </Typography>
    </Box>
  );
}
