import { Avatar, Box, IconButton, Paper, TextField, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const theme = useTheme();

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
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: 2,
        }}
      >
        {messageList.map((msg, idx) => {
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
