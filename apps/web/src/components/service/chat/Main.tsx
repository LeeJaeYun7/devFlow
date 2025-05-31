import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Container,
  TextFieldProps,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState, useCallback, useRef } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { ChatContent } from './Content';
import { useCreateMessage, useMessageList } from '../../../hooks/useMessage';
import { useUser } from '../../../context/UserProvider';
import { useUserMySelf } from '@lia/react/hooks/useUser';
import { enqueueSnackbar } from 'notistack';
import { useSSEEvent } from '../../../context/SSEContext';
import { FirstRecommend } from './FirstRecommend';

export function ChatMain() {
  const { nowChatId } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight + 200;
    }
  };

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
        scrollToBottom();
        return;
      }

      // 스트리밍 컨텐츠 누적 및 임시 메시지 업데이트
      if (data.content) {
        setAiStreamContent((prev) => prev + data.content);
        scrollToBottom();
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
      setTempUserContent(message);
      scrollToBottom();

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

  useEffect(() => {
    setTempUserContent('');
    setIsSending(false);
    setMessage('');
    setAiStreamContent('');
    scrollToBottom();
  }, [nowChatId]);

  const isNothing = (messageList?.data ?? []).length === 0 && tempUserContent === '';

  // 메시지 리스트가 변경될 때마다 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messageList?.data]);

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
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 0, md: 3 },
          height: '100%',
          position: 'relative',
        }}
      >
        {isNothing && <FirstRecommend />}

        {!isNothing && (
          <Box
            sx={{
              flex: 1,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              ref={chatContainerRef}
              sx={{
                height: '100%',
                overflowY: 'auto',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                msOverflowStyle: 'none', // IE, Edge
                scrollbarWidth: 'none', // Firefox
                '&::-webkit-scrollbar': {
                  // Chrome, Safari
                  display: 'none',
                },
              }}
            >
              <Box
                sx={{
                  py: { xs: 2, md: 3 },
                  px: { xs: 2, md: 3 },
                }}
              >
                <ChatContent
                  messageData={messageList?.data ?? []}
                  aiStreamContent={aiStreamContent}
                  tempUserContent={tempUserContent}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* 입력 영역 */}
        <Box
          sx={{
            position: isMobile && isNothing ? 'fixed' : 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            px: { xs: 2, md: 11 },
            pb: { xs: 2, md: 0 },
            pt: 2,
            bgcolor: 'background.default',
            borderTop: 1,
            borderColor: 'divider',
            boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
              borderRadius: '16px',
              mx: 'auto',
              width: '100%',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <InputTextField
                isSending={isSending}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              {isSending ? (
                <CircularProgress
                  size={24}
                  sx={{
                    color: 'text.secondary',
                    mx: 1,
                  }}
                />
              ) : (
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
                    width: 32,
                    height: 32,
                  }}
                >
                  <SendIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

function InputTextField(props: TextFieldProps & { isSending: boolean }) {
  const { isSending, ...rest } = props;
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (isSending) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 5 ? prev + '.' : ''));
      }, 500);
      return () => clearInterval(interval);
    }

    return () => {
      setDots('');
    };
  }, [isSending]);

  return (
    <TextField
      {...rest}
      fullWidth
      disabled={isSending}
      multiline
      placeholder={isSending ? `Generating${dots}` : 'Type message'}
      variant="standard"
      sx={{
        '& .MuiInputBase-root': {
          padding: '4px 8px',
          fontSize: { xs: '0.875rem', md: '1rem' },
        },
        '& .MuiInput-underline:before': { borderBottom: 'none' },
        '& .MuiInput-underline:after': { borderBottom: 'none' },
      }}
    />
  );
}
