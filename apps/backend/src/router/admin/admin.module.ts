import { Module } from '@nestjs/common';
import { SystemPromptModule } from './system_prompt/system_prompt.module';
import { AdminUserModule } from './user/user.module';

@Module({
  imports: [SystemPromptModule, AdminUserModule],
})
export class AdminModule {}
