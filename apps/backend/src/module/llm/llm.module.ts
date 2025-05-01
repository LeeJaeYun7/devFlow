import { Module } from '@nestjs/common';
import { LlmBasicService } from './basic.service';

@Module({
  providers: [LlmBasicService],
  exports: [LlmBasicService],
})
export class LLMModule {}
