import { Box, Button, Stack, Link, Typography, useTheme } from '@mui/material';
import NaverIcon from './NaverIcon';
import KakaoIcon from './KakaoIcon';
import GoogleIcon from './GoogleIcon';
import { BASE_API_URL } from '../../constants/api.constant';

function Footer() {
  return (
    <Box sx={{ width: '100%', px: 2 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography color="text.primary" fontSize={14} fontWeight={600} mb={1}>
          주식회사 더리버뱅크
        </Typography>
        <Typography color="text.secondary" fontSize={12} mb={0.5}>
          대표자 : 성종헌 주소 : 서울특별시 강남구 강남대로112길 47, 2층-에이 1602호(논현동)
        </Typography>
        <Typography color="text.secondary" fontSize={12} mb={0.5}>
          TEL: +82 0502191478880
        </Typography>
        <Typography color="text.secondary" fontSize={12} mb={0.5}>
          사업자 등록번호: 601-86-03065
        </Typography>
        <Typography color="text.secondary" fontSize={12} mb={2}>
          사업의 종류: 응용 소프트웨어 개발 및 공급업
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Typography color="text.secondary" fontSize={12}>
            ©2025 주식회사 리버뱅크
          </Typography>
          <Box display="flex" gap={2}>
            <Link href="#" color="text.secondary" fontSize={12} underline="hover">
              이용약관
            </Link>
            <Link href="#" color="text.secondary" fontSize={12} underline="hover">
              개인정보처리방침
            </Link>
            <Link href="#" color="text.secondary" fontSize={12} underline="hover">
              운영정책
            </Link>
            <Link href="#" color="text.secondary" fontSize={12} underline="hover">
              청소년보호정책
            </Link>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <Typography color="text.secondary" fontSize={12}>
              Powered by Lia
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function LoginMain() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: '100vh',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        minHeight="70vh"
        marginTop={10}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box sx={{ width: 135, mb: 5 }}>
          <img
            src={theme.palette.mode === 'dark' ? '/icon/lia_logo_white.svg' : '/icon/lia_logo_black.svg'}
            alt="LIA"
          />
        </Box>

        <Stack spacing={2} width={320}>
          <Button
            variant="contained"
            startIcon={<KakaoIcon />}
            sx={{
              bgcolor: '#FEE500',
              color: '#3C1E1E',
              '&:hover': { bgcolor: '#e6c800' },
              borderRadius: '8px',
              py: 1.5,
            }}
            fullWidth
            onClick={() => {
              window.location.href = `${BASE_API_URL}/api/auth/kakao`;
            }}
          >
            Kakao로 로그인하기
          </Button>
          <Button
            variant="contained"
            startIcon={<NaverIcon />}
            sx={{
              bgcolor: '#03C75A',
              color: '#fff',
              '&:hover': { bgcolor: '#029e48' },
              borderRadius: '8px',
              py: 1.5,
            }}
            fullWidth
            onClick={() => {
              window.location.href = `${BASE_API_URL}/api/auth/naver`;
            }}
          >
            네이버로 로그인하기
          </Button>
          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            sx={{
              bgcolor: '#fff',
              color: '#222',
              border: '1px solid #ddd',
              '&:hover': { bgcolor: '#f5f5f5' },
              borderRadius: '8px',
              py: 1.5,
            }}
            fullWidth
            onClick={() => {
              window.location.href = `${BASE_API_URL}/api/auth/google`;
            }}
          >
            Google로 로그인하기
          </Button>
        </Stack>

        <Box mt={4} display="flex" flexDirection="column" alignItems="center">
          <Box display="flex" gap={2}>
            <Typography color="text.secondary" fontSize={12} textAlign="center">
              <p>
                로그인하시면{' '}
                <Link href="#" color="text.secondary" fontSize={12}>
                  서비스 이용약관
                </Link>{' '}
                및
              </p>
              <p>
                <Link href="#" color="text.secondary" fontSize={12}>
                  개인정보처리방침
                </Link>{' '}
                에 동의하게 되어요.
              </p>
            </Typography>
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
