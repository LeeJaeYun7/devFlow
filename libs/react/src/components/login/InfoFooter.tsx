import { Box, Link, SxProps, Theme, Typography } from '@mui/material';

interface InfoFooterProps {
  sx?: SxProps<Theme>;
}

export default function InfoFooter({ sx }: InfoFooterProps) {
  return (
    <Box sx={{ width: '100%', px: 2, ...sx }}>
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
            <Link href="/faq" color="text.secondary" fontSize={12} underline="hover">
              이용약관
            </Link>
            <Link href="/faq" color="text.secondary" fontSize={12} underline="hover">
              개인정보처리방침
            </Link>
            <Link href="/faq" color="text.secondary" fontSize={12} underline="hover">
              운영정책
            </Link>
            <Link href="/faq" color="text.secondary" fontSize={12} underline="hover">
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
