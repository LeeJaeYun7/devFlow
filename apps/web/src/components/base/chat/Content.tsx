import { Box, Avatar, Paper, useTheme, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Message } from '../../../hooks/useMessage';
import { useMemo } from 'react';
import remarkGfm from 'remark-gfm';

interface ChatContentProps {
  messageData: Message[] | undefined;
  aiStreamContent?: string;
  tempUserContent?: string;
}

export function ChatContent({ messageData, aiStreamContent, tempUserContent }: ChatContentProps) {
  const theme = useTheme();
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
    <Box
      sx={{
        flexGrow: 1,
        p: 2,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 2,
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {totalMessages.map((msg, idx) => {
        return (
          <Box
            key={`${msg.id}-${idx}`}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
            }}
          >
            {msg.role === 'assistant' && (
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  mr: 1,
                  width: 32,
                  height: 32,
                }}
              >
                LIA
              </Avatar>
            )}
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor:
                  msg.role === 'user'
                    ? theme.palette.mode === 'dark'
                      ? 'primary.dark'
                      : 'primary.main'
                    : 'background.paper',
                color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                borderRadius: 2,
              }}
            >
              <Box>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 1.5,
                  opacity: 0.7,
                  color: msg.role === 'user' ? 'inherit' : 'text.secondary',
                }}
              >
                {new Date(msg.createdAt).toLocaleTimeString()}
              </Typography>
            </Paper>
            {msg.role === 'user' && (
              <Avatar
                sx={{
                  bgcolor: 'secondary.main',
                  ml: 1,
                  width: 32,
                  height: 32,
                }}
              >
                U
              </Avatar>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
