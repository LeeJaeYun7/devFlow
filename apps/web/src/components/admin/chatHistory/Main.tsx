import { Box, Divider, Grid, Select, FormControl, InputLabel } from '@mui/material';
import { StatisticsCard } from '../../base/card/Statistics';
import { useEffect, useState } from 'react';
import { ChatContent } from '../../base/chat/Content';

const metrics = [
  { label: 'Total Chat', value: 1200, diff: 50, diffPercent: 4.35 },
  { label: 'Daily Chat', value: 1200, diff: 50, diffPercent: 4.35 },
];

const dumpList = [
  { id: '123456', role: 'user', createdAt: '2025-05-04 12:00:00', content: '지금 삼전 들어가도 돼?' },
  { id: '123457', role: 'assistant', createdAt: '2025-05-04 12:00:01', content: '삼전 들어가도 돼요' },
  { id: '123458', role: 'user', createdAt: '2025-05-04 12:00:02', content: '근거가 뭐야?' },
  {
    id: '123459',
    role: 'assistant',
    createdAt: '2025-05-04 12:00:03',
    content: '근거는 최근 주가 동향을 보면 알 수 있어요.',
  },
].reverse() as any[];

export function ChatHistoryMain() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedChatTitle, setSelectedChatTitle] = useState<string | null>(null);
  const [chatList, setChatList] = useState<any[]>([]);

  useEffect(() => {
    setChatList(dumpList);
  }, [selectedUser, selectedChatTitle]);

  return (
    <Box>
      {/* 상단 요약 카드 */}
      <Grid container spacing={2} mb={4}>
        {metrics.map((metric) => (
          <StatisticsCard key={metric.label} {...metric} />
        ))}
      </Grid>

      {/* 유저 선택, 채팅 제목 선택 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>유저 선택</InputLabel>
          <Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} />
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>{selectedUser ? '채팅 제목 선택' : '유저 선택 후 채팅 제목 선택'}</InputLabel>
          <Select
            disabled={!selectedUser}
            value={selectedChatTitle}
            onChange={(e) => setSelectedChatTitle(e.target.value)}
          />
        </FormControl>
      </Box>

      <Divider />
      {/* 채팅 내용 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          overflow: 'auto',
        }}
      >
        <ChatContent messageList={chatList} />
      </Box>
    </Box>
  );
}
