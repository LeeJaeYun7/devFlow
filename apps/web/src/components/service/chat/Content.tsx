import { Box, Paper, useTheme, Typography, Container, useMediaQuery } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Message } from '../../../hooks/useMessage';
import { useMemo } from 'react';
import remarkGfm from 'remark-gfm';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface ChatContentProps {
  messageData: Message[] | undefined;
  aiStreamContent?: string;
  tempUserContent?: string;
}

export function ChatContent({ messageData, aiStreamContent, tempUserContent }: ChatContentProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const totalMessages = useMemo(() => {
    const messages = [];

    if (aiStreamContent) {
      messages.push({
        id: `temp-${Date.now()}`,
        content: aiStreamContent,
        role: 'assistant',
        createdAt: new Date(),
      });
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
      messages.push(...messageData);
    }

    return messages;
  }, [messageData, aiStreamContent, tempUserContent]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', marginBottom: '100px' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          pt: isMobile ? 0 : 6,
          pb: isMobile ? 2 : 4,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ width: 80, height: 80, mb: 2, borderRadius: '24px', overflow: 'hidden' }}>
          <img src="/icon/lia.png" alt="LIA" style={{ width: '100%', height: '100%' }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <Typography variant="h6" fontWeight={500}>
            LIA
          </Typography>
          <ArrowForwardIosIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          무슨 일인지 말씀을 해 주세요.
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ flex: 1, px: { xs: 2, sm: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: 3,
            height: '100%',
            overflowY: 'auto',
            py: 3,
          }}
        >
          {totalMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const date = new Date(msg.createdAt);
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
                }}
              >
                {!isUser && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
                      LIA
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
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      maxWidth: isMobile ? '100%' : '80%',
                      bgcolor: isUser ? 'primary.main' : theme.palette.mode === 'dark' ? 'background.paper' : '#f8f9fb',
                      color: isUser ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                      '& p': {
                        m: 0,
                      },
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </Paper>
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
