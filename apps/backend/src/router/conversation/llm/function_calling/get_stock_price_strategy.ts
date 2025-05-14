import { Injectable } from '@nestjs/common';
import { FunctionCalling } from './function.type';
import { ChatCompletionTool } from 'openai/resources';

@Injectable()
export class FunctionGetStockPriceStrategy implements FunctionCalling {
  public getToolDefinition(): ChatCompletionTool {
    return {
      type: 'function',
      function: {
        name: 'get_stock_price',
        description: 'Retrieve the closing stock prices for specific dates',
        parameters: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Stock symbol code (e.g., 005930 for Samsung Electronics, 035720 for Kakao)',
            },
            dateList: {
              type: 'array',
              description: 'List of dates to retrieve stock prices (format: YYYY-MM-DD)',
              items: { type: 'string' },
            },
          },
          required: ['code', 'dateList'],
        },
      },
    };
  }

  public async execute(args: GetStockPriceArgs): Promise<number[]> {
    const { code, dateList } = args;
    console.log(code, dateList);
    return [];
  }
}

interface GetStockPriceArgs {
  code: string;
  dateList: string[];
}