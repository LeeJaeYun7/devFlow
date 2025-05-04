import { Box, Card, CardContent, Typography, Paper, useTheme, Grid, Chip } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DataGrid } from '@mui/x-data-grid';

// 상단 요약 카드용 mock 데이터
type Metric = {
  label: string;
  value: number;
  diff: number; // 전날 대비 증감 수치
  diffPercent: number; // 전날 대비 증감률
};

const metrics: Metric[] = [
  { label: 'DAU', value: 1200, diff: 50, diffPercent: 4.35 },
  { label: 'Total User', value: 15000, diff: 100, diffPercent: 0.67 },
  { label: 'NRU', value: 80, diff: -10, diffPercent: -11.1 },
  { label: 'Total DAU', value: 320000, diff: 2000, diffPercent: 0.63 },
  { label: 'D1 Retention', value: 42.5, diff: 1.2, diffPercent: 2.91 },
  { label: 'D7 Retention', value: 18.3, diff: -0.5, diffPercent: -2.66 },
];

// 유저 테이블용 mock 데이터
type User = {
  email: string;
  createdAt: string;
  lastLoginAt: string;
  chatCount: number;
  sso: 'kakao' | 'google' | 'naver';
};

const users: User[] = [
  {
    email: 'user1@email.com',
    createdAt: '2024-06-01 10:12',
    lastLoginAt: '2024-06-10 09:30',
    chatCount: 12,
    sso: 'kakao',
  },
  {
    email: 'user2@email.com',
    createdAt: '2024-05-28 14:22',
    lastLoginAt: '2024-06-09 20:10',
    chatCount: 5,
    sso: 'google',
  },
  {
    email: 'user3@email.com',
    createdAt: '2024-06-05 08:45',
    lastLoginAt: '2024-06-10 08:00',
    chatCount: 20,
    sso: 'naver',
  },
  {
    email: 'user4@email.com',
    createdAt: '2024-06-03 16:00',
    lastLoginAt: '2024-06-08 21:15',
    chatCount: 2,
    sso: 'kakao',
  },
];

export function UserMain() {
  const theme = useTheme();

  return (
    <Box>
      {/* 상단 요약 카드 */}
      <Grid container spacing={2} mb={4}>
        {metrics.map((metric) => {
          const isUp = metric.diff > 0;
          const isDown = metric.diff < 0;
          return (
            <Grid component="div" key={metric.label}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {metric.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} mb={1}>
                    {metric.label.includes('Retention') ? `${metric.value.toFixed(1)}%` : metric.value.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {isUp && <ArrowDropUpIcon sx={{ color: theme.palette.success.main }} />}
                    {isDown && <ArrowDropDownIcon sx={{ color: theme.palette.error.main }} />}
                    <Typography
                      variant="body2"
                      sx={{
                        color: isUp ? theme.palette.success.main : isDown ? theme.palette.error.main : 'text.secondary',
                        fontWeight: 600,
                      }}
                    >
                      {metric.diff > 0 ? '+' : ''}
                      {metric.diff} ({metric.diffPercent > 0 ? '+' : ''}
                      {metric.diffPercent.toFixed(2)}%)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 유저 테이블 */}
      <Typography variant="h6" mb={2} fontWeight={700}>
        유저 목록
      </Typography>
      <Paper>
        <DataGrid
          sx={{ border: 0 }}
          rowSelection={false}
          rows={Array.from({ length: 100 }, () => users[Math.floor(Math.random() * users.length)]).map((user, i) => ({
            ...user,
            createdAt: new Date(user.createdAt).toLocaleString(),
            lastLoginAt: new Date(user.lastLoginAt).toLocaleString(),
            id: user.email + i,
          }))}
          initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
          pageSizeOptions={[10, 20, 50, 100]}
          columns={[
            {
              field: 'email',
              headerName: 'Email',
              flex: 1,
            },
            {
              field: 'sso',
              headerName: 'SNS',
              renderCell: (params) => {
                return <Chip label={params.row.sso.toUpperCase()} size="small" color={SsoColorMap[params.row.sso]} />;
              },
            },
            {
              field: 'createdAt',
              headerName: '생성 시각',
              flex: 1,
            },
            {
              field: 'lastLoginAt',
              headerName: '마지막 접속 시각',
              flex: 1,
            },
            {
              field: 'chatCount',
              headerName: '채팅 개수',
              flex: 1,
            },
          ]}
        />
      </Paper>
    </Box>
  );
}

const SsoColorMap = {
  kakao: 'warning',
  google: 'primary',
  naver: 'success',
} as const;
