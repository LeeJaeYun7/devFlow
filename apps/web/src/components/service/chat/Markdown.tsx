import { Box, Paper, useMediaQuery, useTheme } from '@mui/material';
import 'github-markdown-css/github-markdown-light.css';
import ReactMarkdown from 'react-markdown';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';

interface ChatContentMarkdownProps {
  content: string;
  isUser: boolean;
}

export default function ChatContentMarkdown({ content, isUser }: ChatContentMarkdownProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        maxWidth: isMobile ? '100%' : '70%',
        bgcolor: isUser ? 'primary.main' : 'background.paper',
        color: isUser ? 'primary.contrastText' : 'text.primary',
        borderRadius: 2,
        '& p': {
          m: 0,
        },
      }}
    >
      <Box
        className="markdown-body"
        sx={{
          color: isUser ? 'primary.contrastText' : 'text.primary',
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          '& ol': {
            listStyleType: 'decimal',
            paddingLeft: '0px',
          },
          '& ul': {
            listStyleType: 'disc',
            paddingLeft: '20px',
          },
          '& li': {
            display: 'list-item',
            margin: '4px 0',
          },
          '&.markdown-body': {
            backgroundColor: 'inherit !important',
            color: 'inherit !important',
          },
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkEmoji, remarkGfm]}>{content}</ReactMarkdown>
      </Box>
    </Paper>
  );
}
