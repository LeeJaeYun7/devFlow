import { Box, Paper, useTheme, Typography, Container, useMediaQuery } from '@mui/material';
import { Message } from '../../../hooks/useMessage';
import { useEffect, useMemo } from 'react';
import { Loading } from './Loading';
import ChatContentMarkdown from './Markdown';

interface ChatContentProps {
  messageData: Message[] | undefined;
  aiStreamContent?: string;
  tempUserContent?: string;
  isSending: boolean;
  moveScrollToBottom: () => void;
}

export function ChatContent({
  messageData,
  aiStreamContent,
  tempUserContent,
  isSending,
  moveScrollToBottom,
}: ChatContentProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const totalMessages = useMemo(() => {
    const messages = [];

    if (aiStreamContent) {
      messages.push(...splitAiContent(aiStreamContent, new Date()));
    }

    if (tempUserContent) {
      messages.push({
        id: `temp-${Date.now()}`,
        content: tempUserContent,
        role: 'user',
        createdAt: new Date(),
      });
    }

    if (messageData) {
      for (const msg of messageData) {
        if (msg.role === 'assistant') {
          messages.push(...splitAiContent(msg.content, msg.createdAt));
        } else {
          messages.push(msg);
        }
      }
    }

    return messages;
  }, [messageData, aiStreamContent, tempUserContent]);

  const shouldShowDate = (currentDate: Date, prevDate?: Date, isFirst = false) => {
    if (isFirst) return true;
    if (!prevDate) return false;

    return (
      currentDate.getFullYear() !== prevDate.getFullYear() ||
      currentDate.getMonth() !== prevDate.getMonth() ||
      currentDate.getDate() !== prevDate.getDate()
    );
  };

  useEffect(() => {
    moveScrollToBottom();
  }, [totalMessages, moveScrollToBottom]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ flex: 1, px: { xs: 2, sm: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column-reverse',
            height: '100%',
            overflowY: 'auto',
          }}
        >
          {!aiStreamContent && isSending && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                mt: 2,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  maxWidth: isMobile ? '100%' : '70%',
                  borderRadius: 2,
                  width: 100,
                  height: 50,
                }}
              >
                <Loading />
              </Paper>
            </Box>
          )}
          {totalMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const date = new Date(msg.createdAt);
            const prevDate = idx < totalMessages.length - 1 ? new Date(totalMessages[idx + 1].createdAt) : undefined;
            const showDate = shouldShowDate(date, prevDate, idx === totalMessages.length - 1);

            const time = date.toLocaleTimeString('ko-KR', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: false,
            });

            return (
              <Box
                key={`${msg.id}-${idx}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  marginTop: '20px',
                }}
              >
                {showDate && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        color: 'white',
                        fontSize: '0.875rem',
                        bgcolor: 'secondary.light',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {date.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long',
                      })}
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-end',
                    gap: isMobile ? 0 : 1,
                  }}
                >
                  {isUser && <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{time}</Typography>}
                  <ChatContentMarkdown content={msg.content} isUser={isUser} />
                  {!isUser && <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{time}</Typography>}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}

function splitAiContent(content: string, targetDate: Date) {
  const lines = content.split('\n');
  const messages: Message[] = [];

  let nowContent = '';
  let tempId = new Date(targetDate).getTime();

  for (const line of lines) {
    // bold가 있으면 새로운 메세지로 처리
    if (nowContent && line.startsWith('**') && line.endsWith('**')) {
      messages.push({
        id: `temp-${tempId++}`,
        content: nowContent,
        role: 'assistant',
        createdAt: targetDate,
      });
      nowContent = line + '\n\n';
      continue;
    }
    nowContent += line + '\n';
  }

  if (nowContent) {
    messages.push({
      id: `temp-${tempId++}`,
      content: nowContent,
      role: 'assistant',
      createdAt: targetDate,
    });
  }

  return messages.reverse();
}
