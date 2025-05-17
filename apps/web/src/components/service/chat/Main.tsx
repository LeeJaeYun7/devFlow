import { Box, CircularProgress, IconButton, Paper, TextField } from '@mui/material';
import { useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { ChatContent } from '../../base/chat/Content';
import { useCreateMessage, useMessageList } from '../../../hooks/useMessage';
import { useUser } from '../../../context/UserProvider';

export function ChatMain() {
  const { nowChatId } = useUser();
  const [message, setMessage] = useState('');
  const { data: messageList } = useMessageList({
    chatId: nowChatId,
    page: 1,
    limit: 50,
  });
  const { mutateAsync: createMessage, isPending } = useCreateMessage();

  const handleSendMessage = async () => {
    await createMessage({ chatId: nowChatId, content: message });
    setMessage('');
  };

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
      <ChatContent messageData={messageList?.data} />

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
            disabled={isPending}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="주식과 투자 관련된 질문을 해보세요!"
            variant="outlined"
            size="small"
          />
          {isPending ? (
            <CircularProgress color="secondary" />
          ) : (
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!message.trim() || isPending}
              sx={{ alignSelf: 'flex-end' }}
            >
              <SendIcon />
            </IconButton>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
