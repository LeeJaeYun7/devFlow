import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './conversation/chat/chat.module';
import { MessageModule } from './conversation/message/message.module';
import { LlmModule } from './conversation/llm/llm.module';
import { HealthCheckModule } from './health-check/health_check.module';
import { UserModule } from './user/user.module';
import { SseModule } from './sse/sse.module';

@Module({
  imports: [
    AuthModule,
    AdminModule,
    ChatModule,
    MessageModule,
    LlmModule,
    HealthCheckModule,
    UserModule,
    SseModule,
  ],
})
export class RouterModule {}
