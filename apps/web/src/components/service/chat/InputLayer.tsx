import { Box, Paper, IconButton, TextFieldProps, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';

interface InputLayerProps {
  isSending: boolean;
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
}

export default function InputLayer({ isSending, message, setMessage, handleSendMessage }: InputLayerProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 2 },
        bgcolor: 'background.paper',
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
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!message.trim() || isSending}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: 32,
            height: 32,
          }}
        >
          <SendIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Paper>
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
      slotProps={{
        input: {
          disableUnderline: true,
        },
      }}
      sx={{
        '& .MuiInput-underline:before': { borderBottom: 'none' },
        '& .MuiInput-underline:after': { borderBottom: 'none' },
      }}
    />
  );
}
