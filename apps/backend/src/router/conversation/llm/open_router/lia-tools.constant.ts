import { OpenRouterTool } from './open_router.type';

export const tools: OpenRouterTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_technical_data',
      description:
        'Get technical data for a given symbol (e.g. "011070.KS"). Returns OHLCV data and indicators for technical analysis.',
      parameters: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'The symbol to get data for' },
        },
        required: ['symbol'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_fundamental_data',
      description:
        'Get latest fundamental data for a given symbol (e.g. "011070.KS"). Returns fundamental metrics for fundamental analysis.',
      parameters: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'The symbol to get data for' },
        },
        required: ['symbol'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_all_dart_financials',
      description: 'Fetch all available DART quarterly financial summaries (revenue, operating profit, net income) for a given Korean stock symbol.',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Korean stock code (e.g., "005930.KS" for Samsung Electronics)',
          },
        },
        required: ['symbol'],
      },
    },
  }
];
