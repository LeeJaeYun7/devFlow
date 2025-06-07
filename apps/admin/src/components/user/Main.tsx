import { Box, Typography, Paper, Grid, Chip } from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';
import { StatisticsCard } from '@lia/react/components/card/Statistics';
import { useUserList, useUserMetric } from '../../hooks/useUser';
import { useState } from 'react';

export function UserMain() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const { data: userList, refetch } = useUserList({ page: page + 1, limit });
  const { data: userMetric } = useUserMetric({});

  const metrics = [
    {
      label: 'DAU',
      value: userMetric?.data.dau.value ?? 0,
      diff: userMetric?.data.dau.diff ?? 0,
      diffPercent: userMetric?.data.dau.diffRate ?? 0,
    },
    {
      label: 'Total User',
      value: userMetric?.data.totalUser.value ?? 0,
      diff: userMetric?.data.totalUser.diff ?? 0,
      diffPercent: userMetric?.data.totalUser.diffRate ?? 0,
    },
    {
      label: 'NRU',
      value: userMetric?.data?.nru?.value ?? 0,
      diff: userMetric?.data?.nru?.diff ?? 0,
      diffPercent: userMetric?.data?.nru?.diffRate ?? 0,
    },
    {
      label: 'D1 Retention',
      value: userMetric?.data.d1Retention.value ?? 0,
      diff: userMetric?.data.d1Retention.diff ?? 0,
      diffPercent: userMetric?.data.d1Retention.diffRate ?? 0,
    },
    {
      label: 'D7 Retention',
      value: userMetric?.data.d7Retention.value ?? 0,
      diff: userMetric?.data.d7Retention.diff ?? 0,
      diffPercent: userMetric?.data.d7Retention.diffRate ?? 0,
    },
  ];

  return (
    <Box>
      {/* 상단 요약 카드 */}
      <Grid container spacing={2} mb={4}>
        {metrics.map((metric) => (
          <StatisticsCard key={metric.label} {...metric} />
        ))}
      </Grid>

      {/* 유저 테이블 */}
      <Typography variant="h6" mb={2} fontWeight={700}>
        유저 목록
      </Typography>
      <Paper>
        <DataGrid
          sx={{ border: 0 }}
          rowSelection={false}
          rows={
            userList?.data.data.map((user, i) => ({
              ...user,
              createdAt: new Date(user.createdAt).toLocaleString(),
              lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '',
              id: user.email + i,
            })) ?? []
          }
          rowCount={userList?.data.meta.total}
          paginationMode="server"
          initialState={{ pagination: { paginationModel: { page, pageSize: limit } } }}
          paginationModel={{ page, pageSize: limit }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setLimit(model.pageSize);
            refetch();
          }}
          pageSizeOptions={[20, 50, 100]}
          columns={[
            {
              field: 'email',
              headerName: 'Email',
              flex: 1,
            },
            {
              field: 'sso',
              headerName: 'SSO',
              renderCell: (params) => {
                return (
                  <Chip
                    label={params.row.provider.toUpperCase()}
                    size="small"
                    color={SsoColorMap[params.row.provider]}
                  />
                );
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
              field: 'remainingMessages',
              headerName: '남은 메시지',
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
