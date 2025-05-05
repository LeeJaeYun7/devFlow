import { Module } from '@nestjs/common';
import { SystemPromptModule } from './system_prompt/system_prompt.module';

@Module({
  imports: [SystemPromptModule],
})
export class AdminModule {}
