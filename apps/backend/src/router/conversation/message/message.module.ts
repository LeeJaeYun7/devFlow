import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageModel, MessageSchema } from '../../../module/mongo/model/message.model';
import { LlmModule } from '../llm/llm.module';
import { FinanceModule } from '../../finance/finance.module';
import { UserMessageQuotaModel } from '../../../module/mongo/model/user_message_quota.model';
import { UserMessageQuotaSchema } from '../../../module/mongo/model/user_message_quota.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MessageModel.name, schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: UserMessageQuotaModel.name, schema: UserMessageQuotaSchema }]),
    LlmModule,
    FinanceModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
