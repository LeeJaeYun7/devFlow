import { Module } from '@nestjs/common';
import { SampleModule } from './sample/sample.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './conversation/chat/chat.module';
import { MessageModule } from './conversation/message/message.module';
import { HealthCheckModule } from './health-check/health_check.module';

@Module({
  imports: [AuthModule, SampleModule, AdminModule, ChatModule, MessageModule, HealthCheckModule],
})
export class RouterModule {}
