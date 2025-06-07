import { Box, Button, Divider, Paper, TextField, Typography, Autocomplete } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSystemPrompt, usePatchSystemPrompt } from '../../hooks/useSystemPrompt';
import { useSystemModelList, usePatchSystemModel } from '../../hooks/useSystemModel';
import {
  SystemModel,
  SystemModelTargetList,
  SystemModelTarget,
} from '@lia/api/admin/system_model/system_model.constant';

import AnthropicIcon from './icon/anthropic.svg';
import OpenAIIcon from './icon/openai.svg';
import GoogleIcon from './icon/google.svg';
import MetaIcon from './icon/meta.svg';

const supportedProvider = ['anthropic', 'openai', 'google', 'meta-llama'];
const requiredParameters = ['tools', 'tool_choice'];

export function SystemPromptMain() {
  const { data: prompt } = useSystemPrompt();
  const [input, setInput] = useState('');
  const patchMutation = usePatchSystemPrompt();
  const { data: modelList } = useSystemModelList();

  const [useableModelList, setUseableModelList] = useState<string[]>([]);

  useEffect(() => {
    if (prompt) setInput(prompt);
  }, [prompt]);

  useEffect(() => {
    fetch('https://openrouter.ai/api/v1/models')
      .then((res) => res.json())
      .then((data: { data: OpenRouterModel[] }) => {
        const list = data.data.filter((model) => {
          const isSupportedProvider = supportedProvider.includes(model.id.split('/')[0]);

          for (const parameter of requiredParameters) {
            if (!model.supported_parameters.includes(parameter)) {
              return false;
            }
          }

          return isSupportedProvider;
        });
        setUseableModelList(list.map((model) => model.id).sort());
      });
  }, []);

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={2}>
        시스템 모델 수정
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        변경 시, 바로 적용됩니다.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SystemModelTargetList.map((target) => {
          const selectedModel = modelList?.data.models.find((model) => model.target === target)?.modelId;

          if (!selectedModel) return null;

          return (
            <Box key={target} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" fontWeight={500} sx={{ width: '100px' }}>
                {target.charAt(0).toUpperCase() + target.slice(1)}
              </Typography>
              <ModelSelect target={target} nowModel={selectedModel} modelList={useableModelList} />
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ my: 2 }} />

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

function ModelSelect({
  target,
  nowModel,
  modelList,
}: {
  target: SystemModelTarget;
  nowModel: string | undefined;
  modelList: string[];
}) {
  const [selectedModel, setSelectedModel] = useState<string | undefined>(nowModel);
  const patchModelMutation = usePatchSystemModel();

  return (
    <Autocomplete
      size="small"
      sx={{ width: '250px' }}
      options={modelList}
      value={selectedModel}
      onChange={(_, newValue) => {
        const value = newValue as SystemModel;
        setSelectedModel(value);
        if (modelList.includes(value)) {
          patchModelMutation.mutate({ target, modelId: value });
        }
      }}
      renderOption={(props, option) => {
        const [provider, model] = option.split('/');
        const icon = getModelIcon(option);

        return (
          <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon && <img src={icon} alt={provider} width={20} height={20} />}
            <Typography>{model}</Typography>
          </Box>
        );
      }}
      disabled={patchModelMutation.isPending}
      renderInput={(params) => {
        const [provider] = (selectedModel || '').split('/');
        const icon = getModelIcon(selectedModel || '');
        return (
          <TextField
            {...params}
            value={selectedModel}
            placeholder="모델 검색..."
            size="small"
            InputProps={{
              ...params.InputProps,
              startAdornment: icon && (
                <img
                  src={icon}
                  alt={provider}
                  width={20}
                  height={20}
                  style={{ background: 'white', borderRadius: '50%', padding: 2 }}
                />
              ),
            }}
          />
        );
      }}
      disableClearable
    />
  );
}

function getModelIcon(modelFull: string) {
  const [provider] = modelFull.split('/');
  let icon;

  switch (provider) {
    case 'anthropic':
      icon = AnthropicIcon;
      break;
    case 'openai':
      icon = OpenAIIcon;
      break;
    case 'google':
      icon = GoogleIcon;
      break;
    case 'meta-llama':
      icon = MetaIcon;
      break;
    default:
      icon = null;
  }

  return icon;
}

interface OpenRouterModel {
  id: string;
  name: string;
  supported_parameters: string[];
}
