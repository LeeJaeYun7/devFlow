import { Box, Container, useTheme, useMediaQuery, SxProps, Theme } from '@mui/material';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ChatContent } from './Content';
import { useCreateMessage, useMessageList } from '../../../hooks/useMessage';
import { useUser } from '@lia/react/context/UserProvider';
import { useUserMySelf } from '@lia/react/hooks/useUser';
import { enqueueSnackbar } from 'notistack';
import { useSSEEvent } from '../../../context/SSEContext';
import { FirstRecommend } from './FirstRecommend';
import InputLayer from './InputLayer';
import LoginModal from '@lia/react/components/login/LoginModal';

export function ChatMain() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { nowChatId, isLogin } = useUser();
  const { refetch: refetchUserMySelf, data: userMySelf } = useUserMySelf();
  const { data: messageList, refetch: refetchMessageList } = useMessageList({
    chatId: nowChatId,
    page: 1,
    limit: 50,
  });
  const { mutateAsync: createMessage } = useCreateMessage();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [tempUserContent, setTempUserContent] = useState('');
  const [aiStreamContent, setAiStreamContent] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const moveScrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight + 400;
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
    if (!isLogin) {
      setIsLoginModalOpen(true);
      return;
    }

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
  }, [nowChatId]);

  const isNothing = (messageList?.data ?? []).length === 0 && tempUserContent === '';

  // 메시지 리스트가 변경될 때마다 스크롤
  useEffect(() => {
    moveScrollToBottom();
  }, [messageList?.data]);

  return (
    <>
      <LoginModal open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
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
          {isNothing ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                px: { xs: 2, md: 3 },
              }}
            >
              <FirstRecommend />
              <Box sx={{ width: '100%' }}>
                <InputLayer
                  isSending={isSending}
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                />
              </Box>
            </Box>
          ) : (
            <>
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
                      isSending={isSending}
                      moveScrollToBottom={moveScrollToBottom}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={getInputLayerSx(isMobile)}>
                <InputLayer
                  isSending={isSending}
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                />
              </Box>
            </>
          )}
        </Container>
      </Box>
    </>
  );
}

function getInputLayerSx(isMobile: boolean): SxProps<Theme> {
  return {
    position: isMobile ? 'fixed' : 'absolute',
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
  };
}
