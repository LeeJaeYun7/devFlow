import { Box, Card, CardContent, Typography, Stack, Avatar, Link } from '@mui/material';
import { useUserMySelf } from '../../../hooks/useUser';

export function ProfileMain() {
  const { data: userMySelf } = useUserMySelf();

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '800px',
        mx: 'auto',
        p: 3,
      }}
    >
      <Typography variant="h5" sx={{ mb: 4 }}>
        마이페이지
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mb: 4,
        }}
      >
        <Avatar
          src="/icon/lia.png"
          sx={{
            width: 100,
            height: 100,
            mb: 2,
            border: '1px solid #fff',
          }}
        />
        <Typography variant="h6" sx={{ mb: 1 }}>
          {userMySelf?.data?.name}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {userMySelf?.data?.email}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 3,
        }}
      >
        <Card>
          <ProfileContentCard title="등급" content="Free" />
        </Card>
        <Card>
          <ProfileContentCard title="포인트" content="999,999" action="충전하기" />
        </Card>
      </Box>
    </Box>
  );
}

interface ProfileContentCardProps {
  title: string;
  content: string;
  action?: string;
}

function ProfileContentCard({ title, content, action }: ProfileContentCardProps) {
  return (
    <CardContent>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {content}
        </Typography>
        {action && (
          <Typography variant="body2" color="primary.main">
            <Link>{action}</Link>
          </Typography>
        )}
      </Stack>
    </CardContent>
  );
}
