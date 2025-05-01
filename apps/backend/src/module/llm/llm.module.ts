import { Module } from '@nestjs/common';
import { LlmBasicService } from './basic.service';
import { FunctionCallingService, FunctionCallingStrategyList } from './function_calling.service';

@Module({
  providers: [LlmBasicService, FunctionCallingService, ...FunctionCallingStrategyList],
  exports: [LlmBasicService],
})
export class LLMModule {}
