import { Box, Typography } from '@mui/material';

export function FirstRecommend() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 4, md: 6 },
        p: { xs: 2, md: 4 },
        maxWidth: '1200px',
        mx: 'auto',
        background: 'linear-gradient(45deg, #007AFF 30%, #0050A6 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: 500, textAlign: 'center' }}>
        주식 분석,{' '}
        <Box component="span" sx={{ fontWeight: 700 }}>
          리아
        </Box>
        에게 물어보세요.
      </Typography>
    </Box>
  );
}
