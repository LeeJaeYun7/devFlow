import { Box, Link, Typography, useTheme } from '@mui/material';
import { Stack } from '@mui/material';
import { Button } from '@mui/material';
import { BASE_API_URL } from '../../constants/api.constant';
import { GithubIcon } from './GithubIcon';

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
          startIcon={<GithubIcon />}
          sx={{
            bgcolor: '#24292e',
            color: '#fff',
            '&:hover': { bgcolor: '#1b1f23' },
            borderRadius: '8px',
            py: 1.5,
          }}
          fullWidth
          onClick={() => {
            window.location.href = `${BASE_API_URL}/api/auth/github`;
          }}
        >
          GitHub로 로그인하기
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
