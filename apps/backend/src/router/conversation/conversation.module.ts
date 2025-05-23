import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';

@Module({
  imports: [MessageModule],
  exports: [MessageModule],
})
export class ConversationModule {}
