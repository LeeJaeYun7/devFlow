import { Box, IconButton, Paper, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { ChatContent } from '../../base/chat/Content';

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
].reverse();

export function ChatMain() {
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState<any[]>([]);

  const handleSendMessage = () => {
    console.log(message);
    setMessage('');
  };

  useEffect(() => {
    setMessageList(dumpList);
  }, []);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* 채팅 목록 */}
      <ChatContent messageList={messageList} />

      {/* 입력 영역 */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="메시지를 입력하세요..."
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!message.trim()}
            sx={{ alignSelf: 'flex-end' }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}
