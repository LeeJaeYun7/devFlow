import { Box, Button, Typography, Stack, Link } from '@mui/material';
import NaverIcon from './NaverIcon';
import KakaoIcon from './KakaoIcon';
import GoogleIcon from './GoogleIcon';
import { BASE_API_URL } from '../../api/api.constant';

export function LoginMain() {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Typography variant="h3" fontWeight={700} mb={5} color="primary">
        LIA
      </Typography>
      <Stack spacing={2} width={320}>
        <Button
          variant="contained"
          startIcon={<NaverIcon />}
          sx={{ bgcolor: '#03C75A', color: '#fff', '&:hover': { bgcolor: '#029e48' } }}
          fullWidth
          onClick={() => {
            window.location.href = `${BASE_API_URL}/api/auth/naver`;
          }}
        >
          네이버로 로그인
        </Button>
        <Button
          variant="contained"
          startIcon={<KakaoIcon />}
          sx={{ bgcolor: '#FEE500', color: '#3C1E1E', '&:hover': { bgcolor: '#e6c800' } }}
          fullWidth
          onClick={() => {
            window.location.href = `${BASE_API_URL}/api/auth/kakao`;
          }}
        >
          카카오로 로그인
        </Button>
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          sx={{ bgcolor: '#fff', color: '#222', border: '1px solid #ddd', '&:hover': { bgcolor: '#f5f5f5' } }}
          fullWidth
          onClick={() => {
            window.location.href = `${BASE_API_URL}/api/auth/google`;
          }}
        >
          구글로 로그인
        </Button>
      </Stack>
      <Box mt={4}>
        <Link href="#" underline="hover" color="text.secondary">
          이용 약관
        </Link>
      </Box>
    </Box>
  );
}
