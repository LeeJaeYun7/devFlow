import { Box, Typography, useTheme } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import StarIcon from '@mui/icons-material/Star';
import ShieldIcon from '@mui/icons-material/Shield';

export function FirstRecommend() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: { xs: 4, md: 6 },
        p: { xs: 2, md: 4 },
        maxWidth: '1200px',
        mx: 'auto',
        overflow: 'auto',
      }}
    >
      {/* 로고 */}
      <Box sx={{ width: { xs: '80px', md: '120px' }, mb: { xs: 1, md: 2 } }}>
        <img
          src={theme.palette.mode === 'dark' ? '/icon/lia_logo_white.svg' : '/icon/lia_logo_black.svg'}
          alt="LIA"
          style={{ width: '100%', height: 'auto' }}
        />
      </Box>

      {/* 카드 컨테이너 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: { xs: 3, md: 4 },
          width: '100%',
          alignItems: 'start',
        }}
      >
        {/* Examples */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, md: 3 },
            alignItems: 'center',
          }}
        >
          <CommentIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            Examples
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
                minHeight: { xs: '60px', md: '72px' },
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '0.875rem', md: '1rem' },
              }}
            >
              "Is it a good time to buy Tesla right now?"
            </Box>
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
                minHeight: { xs: '60px', md: '72px' },
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '0.875rem', md: '1rem' },
              }}
            >
              What impact will this week's CPI have on the stock market?
            </Box>
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
                minHeight: { xs: '60px', md: '72px' },
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '0.875rem', md: '1rem' },
              }}
            >
              "Give me 3 small-cap stocks likely to rise today."
            </Box>
          </Box>
        </Box>

        {/* Capabilities */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, md: 3 },
            alignItems: 'center',
          }}
        >
          <StarIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            Capabilities
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                minHeight: { xs: '60px', md: '72px' },
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '0.875rem', md: '1rem' },
              }}
            >
              Remembers your portfolio preferences during the chat.
            </Box>
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                minHeight: { xs: '60px', md: '72px' },
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '0.875rem', md: '1rem' },
              }}
            >
              Provides chart-based technical and valuation analysis.
            </Box>
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                minHeight: { xs: '60px', md: '72px' },
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '0.875rem', md: '1rem' },
              }}
            >
              Summarizes real-time news and market sentiment.
            </Box>
          </Box>
        </Box>

        {/* Limitations */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, md: 3 },
            alignItems: 'center',
          }}
        >
          <ShieldIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>
            Limitations
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', mb: { xs: 8, md: 0 } }}>
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                minHeight: { xs: '60px', md: '72px' },
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '0.875rem', md: '1rem' },
              }}
            >
              Does not provide personalized investment advice.
            </Box>
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                minHeight: { xs: '60px', md: '72px' },
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '0.875rem', md: '1rem' },
              }}
            >
              May not reflect the latest after-hours market data.
            </Box>
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                minHeight: { xs: '60px', md: '72px' },
                display: 'flex',
                alignItems: 'center',
                fontSize: { xs: '0.875rem', md: '1rem' },
              }}
            >
              Can occasionally misinterpret ambiguous input.
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
