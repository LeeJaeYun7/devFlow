import { Box, Link, Typography, useTheme } from '@mui/material';
import { Stack } from '@mui/material';
import { Button } from '@mui/material';
import KakaoIcon from './KakaoIcon';
import NaverIcon from './NaverIcon';
import { BASE_API_URL } from '../../constants/api.constant';
import GoogleIcon from './GoogleIcon';

interface LoginContentProps {
  logoWidth?: number;
}

export default function LoginContent({ logoWidth = 135 }: LoginContentProps) {
  const theme = useTheme();
  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Box sx={{ width: logoWidth, mb: 5 }}>
        <img src={theme.palette.mode === 'dark' ? '/icon/lia_logo_white.svg' : '/icon/lia_logo_black.svg'} alt="LIA" />
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
  );
}
