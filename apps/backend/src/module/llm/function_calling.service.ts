import { Injectable } from '@nestjs/common';
import { FunctionCalling } from './function_calling/function.type';
import { FunctionGetStockPriceStrategy } from './function_calling/get_stock_price.strategy';
import { ClassConstructor } from 'class-transformer';
import OpenAI from 'openai';

@Injectable()
export class FunctionCallingService {
  private readonly functionCallingMap: Record<string, FunctionCalling>;
  private readonly functionCallingList: OpenAI.Chat.Completions.ChatCompletionTool[];

  constructor(private readonly functionGetStockPriceStrategy: FunctionGetStockPriceStrategy) {
    const functionCallingStrategyList = [this.functionGetStockPriceStrategy];

    this.functionCallingMap = functionCallingStrategyList.reduce(
      (acc, func) => {
        acc[func.getToolDefinition().function.name] = func;
        return acc;
      },
      {} as Record<string, FunctionCalling>
    );

    this.functionCallingList = functionCallingStrategyList.map((func) => func.getToolDefinition());
  }

  public getFunctionCallingMap(): Record<string, FunctionCalling> {
    return this.functionCallingMap;
  }

  public getFunctionCallingList(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return this.functionCallingList;
  }
}

export const FunctionCallingStrategyList = [FunctionGetStockPriceStrategy] as ClassConstructor<FunctionCalling>[];
