import type { MessageListResponse } from '@lia/api/conversation/message/list.dto';
import { Box, Avatar, Paper, Typography, useTheme } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatContentProps {
  messageData: MessageListResponse['data'] | undefined;
}

export function ChatContent({ messageData }: ChatContentProps) {
  const theme = useTheme();

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
      {(messageData?.data ?? []).map((msg, idx) => {
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
              <Box
                sx={{
                  '& > *:first-child': {
                    mt: 0,
                  },
                  '& > *:last-child': {
                    mb: 0,
                  },
                  '& p': {
                    my: 1,
                    lineHeight: 1.5,
                  },
                  '& ul, & ol': {
                    my: 1,
                    pl: 2,
                  },
                  '& li': {
                    my: 0.5,
                  },
                  '& a': {
                    color: msg.role === 'user' ? 'inherit' : 'primary.main',
                    textDecoration: 'underline',
                  },
                  '& code': {
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor:
                      msg.role === 'user'
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(0, 0, 0, 0.2)'
                          : 'rgba(255, 255, 255, 0.1)'
                        : theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.05)',
                    fontSize: '0.875em',
                    fontFamily: 'monospace',
                  },
                  '& pre': {
                    my: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor:
                      msg.role === 'user'
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(0, 0, 0, 0.2)'
                          : 'rgba(255, 255, 255, 0.1)'
                        : theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.05)',
                    overflow: 'auto',
                    '& code': {
                      p: 0,
                      bgcolor: 'transparent',
                    },
                  },
                  '& table': {
                    borderCollapse: 'collapse',
                    width: '100%',
                    my: 2,
                  },
                  '& th, & td': {
                    border: '1px solid',
                    borderColor:
                      msg.role === 'user'
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(0, 0, 0, 0.3)'
                          : 'rgba(255, 255, 255, 0.2)'
                        : theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.1)',
                    p: 1,
                    textAlign: 'left',
                  },
                  '& th': {
                    bgcolor:
                      msg.role === 'user'
                        ? theme.palette.mode === 'dark'
                          ? 'rgba(0, 0, 0, 0.2)'
                          : 'rgba(255, 255, 255, 0.1)'
                        : theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.05)',
                    fontWeight: 'bold',
                  },
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <Typography component="p" variant="body1">
                        {children}
                      </Typography>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
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
