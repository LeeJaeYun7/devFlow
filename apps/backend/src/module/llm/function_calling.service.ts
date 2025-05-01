import { Injectable } from '@nestjs/common';
import { FunctionCalling } from './function_calling/function.type';
import { FunctionGetStockPriceStrategy } from './function_calling/get_stock_price.strategy';
import { ClassConstructor } from 'class-transformer';

@Injectable()
export class FunctionCallingService {
  private readonly functionCallingMap: Record<string, FunctionCalling>;
  private readonly functionCallingList: FunctionCalling[];

  constructor(private readonly functionGetStockPriceStrategy: FunctionGetStockPriceStrategy) {
    this.functionCallingList = [this.functionGetStockPriceStrategy];

    this.functionCallingMap = this.functionCallingList.reduce(
      (acc, func) => {
        acc[func.getToolDefinition().function.name] = func;
        return acc;
      },
      {} as Record<string, FunctionCalling>
    );
  }

  public getFunctionCallingMap(): Record<string, FunctionCalling> {
    return this.functionCallingMap;
  }

  public getFunctionCallingList(): FunctionCalling[] {
    return this.functionCallingList;
  }
}

export const FunctionCallingStrategyList = [FunctionGetStockPriceStrategy] as ClassConstructor<FunctionCalling>[];
