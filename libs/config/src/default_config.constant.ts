export const DefaultBaseConfig = {
  nodeEnv: 'development',
  apiPort: 4600,
  dataCollectorPort: 4700,

  mongodbUri: 'mongodb+srv://devflow:1234@devflow.wterl7u.mongodb.net/?retryWrites=true&w=majority&appName=devflow',
  jwtSecret: '0196d973-16f1-7ad1-aa37-693870c00af8',

  dartApiKey: '',

  openRouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: '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',
    model: 'openai/gpt-3.5-turbo',
    temperature: 0.7,
  },

  googleOauth: {
    clientId: 'default',
    clientSecret: '',
  },
  kakaoOauth: {
    clientId: 'default',
  },
  naverOauth: {
    clientId: 'default',
    clientSecret: '',
  },
};
