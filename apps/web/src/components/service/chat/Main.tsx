import { Box, CircularProgress, IconButton, Paper, TextField } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { ChatContent } from '../../base/chat/Content';
import { useCreateMessage, useMessageList } from '../../../hooks/useMessage';
import { useUser } from '../../../context/UserProvider';
import { useUserMySelf } from '../../../hooks/useUser';
import { enqueueSnackbar } from 'notistack';
import { useSSEEvent } from '../../../context/SSEContext';

export function ChatMain() {
  const { nowChatId } = useUser();
  const { refetch: refetchUserMySelf, data: userMySelf } = useUserMySelf();
  const [message, setMessage] = useState('');
  const { data: messageList, refetch: refetchMessageList } = useMessageList({
    chatId: nowChatId,
    page: 1,
    limit: 50,
  });
  const { mutateAsync: createMessage } = useCreateMessage();
  const [isSending, setIsSending] = useState(false);
  const [tempUserContent, setTempUserContent] = useState('');
  const [aiStreamContent, setAiStreamContent] = useState('');

  // SSE 이벤트 처리
  const handleChatMessage = useCallback(
    async (event: MessageEvent) => {
      const data = JSON.parse(event.data) as { chatId: string; content?: string; isEnd: boolean };
      if (data.chatId !== nowChatId) return;

      if (data.isEnd) {
        // isEnd가 true이면 실제 데이터로 갱신
        await refetchMessageList();
        setIsSending(false);
        setTempUserContent('');
        setAiStreamContent('');
        return;
      }

      // 스트리밍 컨텐츠 누적 및 임시 메시지 업데이트
      if (data.content) {
        setAiStreamContent((prev) => prev + data.content);
      }
    },
    [nowChatId, refetchMessageList]
  );

  useSSEEvent('chatMessage', handleChatMessage);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if ((userMySelf?.data?.remainMessageQuota ?? 0) === 0) {
      enqueueSnackbar('오늘 메시지 전송 횟수를 초과했습니다.', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }

    try {
      setIsSending(true);
      setAiStreamContent('');
      // 사용자 메시지를 임시 메시지에 추가
      setTempUserContent(message);
      console.log('tempUserContent', message);

      await createMessage({ chatId: nowChatId, content: message });
      await refetchUserMySelf();
      setMessage('');
    } catch (error) {
      console.log('error', error);
      setIsSending(false);
      setTempUserContent('');
      setAiStreamContent('');
    }
  };

  // 채팅방이 변경될 때 상태 초기화
  useEffect(() => {
    setTempUserContent('');
    setIsSending(false);
    setMessage('');
    setAiStreamContent('');
  }, [nowChatId]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* 채팅 목록 */}
      <Box sx={{ flexGrow: 1, minHeight: 0, position: 'relative', height: '200px', overflowY: 'auto' }}>
        <ChatContent
          messageData={messageList?.data ?? []}
          aiStreamContent={aiStreamContent}
          tempUserContent={tempUserContent}
        />
      </Box>

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
            disabled={isSending}
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
          {isSending ? (
            <CircularProgress color="secondary" />
          ) : (
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
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
