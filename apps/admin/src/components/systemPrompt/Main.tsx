import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSystemPrompt, usePatchSystemPrompt } from '../../hooks/useSystemPrompt';

export function SystemPromptMain() {
  const { data: prompt } = useSystemPrompt();
  const [input, setInput] = useState('');
  const patchMutation = usePatchSystemPrompt();

  useEffect(() => {
    if (prompt) setInput(prompt);
  }, [prompt]);

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={2}>
        시스템 프롬프트 수정
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        실제 token 수는 계산된 token 수와 다를 수 있습니다. (표시되는 것이 더 많게 계산됩니다.)
      </Typography>
      <Paper sx={{ p: 3 }}>
        <TextField
          label="System Prompt"
          multiline
          minRows={8}
          maxRows={20}
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="시스템 프롬프트를 입력하세요..."
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {getTokenCount(input)} tokens / 8,192 tokens
          </Typography>
        </Box>
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => patchMutation.mutate(input)}
          disabled={patchMutation.isPending}
        >
          저장
        </Button>
      </Box>
    </Box>
  );
}

function getTokenCount(prompt: string) {
  const words = prompt.trim().split(/\s+/);
  let tokenCount = 0;

  for (const word of words) {
    const koreanChars = word.match(/[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/g)?.length || 0;
    const englishChars = word.length - koreanChars;

    tokenCount += koreanChars * 2.5 + (englishChars > 0 ? 1.3 : 0);
  }

  return Math.ceil(tokenCount);
}
