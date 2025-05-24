import { Box, Button, Fab, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useContext, useEffect } from 'react';
import { ColorModeContext } from '../Theme';
import { Outlet } from 'react-router-dom';
import { useUser } from '../context/UserProvider';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { useUserMySelf } from '../hooks/useUser';

const sidebarWidth = 250;

interface RootLayoutProps {
  sidebar?: React.ReactNode;
}

export function RootLayout({ sidebar }: RootLayoutProps) {
  const theme = useTheme();
  const isNotMobile = useMediaQuery(theme.breakpoints.up('sm'));
  const colorMode = useContext(ColorModeContext);
  const { isLogin, setIsLogin } = useUser();

  // myself에서 401이 발생하면 로그인으로 이동
  const { error } = useUserMySelf();

  useEffect(() => {
    if (error) {
      setIsLogin(false);
      window.location.href = '/login';
    } else {
      setIsLogin(true);
    }
  }, [error]);

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
          <Box sx={{ flex: 1, width: '100%' }}>
            <Outlet />
          </Box>
          <RootFooter />
        </Box>
      </Box>

      {/* 로그인 버튼 */}
      {!isLogin && (
        <Button
          color="inherit"
          size="small"
          variant="contained"
          sx={{
            position: 'fixed',
            top: 24,
            right: 80,
            zIndex: 2000,
            display: 'flex',
            height: '40px',
            gap: 1,
            borderRadius: '100px',
            px: 2,
          }}
          onClick={() => (window.location.href = '/login')}
        >
          <Typography sx={{ fontSize: '0.875rem' }}>로그인</Typography>
        </Button>
      )}

      {/* 로그아웃 버튼 */}
      {isLogin && (
        <Button
          color="inherit"
          size="small"
          variant="contained"
          sx={{
            position: 'fixed',
            top: 24,
            right: 80,
            zIndex: 1000,
            display: 'flex',
            height: '40px',
            gap: 1,
            borderRadius: '100px',
            px: 2,
          }}
          onClick={() => (window.location.href = '/logout')}
        >
          <Typography sx={{ fontSize: '0.875rem' }}>로그아웃</Typography>
        </Button>
      )}

      {/* 다크모드 토글 플로팅 버튼 */}
      <Fab
        color="primary"
        size="small"
        sx={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 1000,
        }}
        onClick={colorMode.toggleColorMode}
      >
        {theme.palette.mode === 'dark' ? (
          <WbSunnyIcon sx={{ fontSize: '1.2rem' }} />
        ) : (
          <NightsStayIcon sx={{ fontSize: '1.2rem' }} />
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
