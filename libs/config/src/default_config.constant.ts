export const DefaultBaseConfig = {
  nodeEnv: 'development',
  apiPort: 4600,
  dataCollectorPort: 4700,

  mongodbUri: 'mongodb://root:password@localhost:27017/lia?authSource=admin',
  jwtSecret: '0196d973-16f1-7ad1-aa37-693870c00af8',

  dartApiKey: '',
  kisAppKey: '',
  kisAppSecret: '',
  kisBaseUrl: 'https://openapi.koreainvestment.com:9443',

  openRouter: {
    url: 'https://api.openrouter.ai/api/v1/chat/completions',
    apiKey: '',
    model: '',
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
