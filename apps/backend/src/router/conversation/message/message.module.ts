import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageModel, MessageSchema } from '../../../module/mongo/model/conversation/models/message.model';
import { LlmModule } from '../llm/llm.module';
import { YahooFinanceModule } from '../../finance/yahoo/yahoo-finance.module';
import { UserMessageQuotaModel } from '../../../module/mongo/model/user/models/user_message_quota.model';
import { UserMessageQuotaSchema } from '../../../module/mongo/model/user/models/user_message_quota.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MessageModel.name, schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: UserMessageQuotaModel.name, schema: UserMessageQuotaSchema }]),
    LlmModule,
    YahooFinanceModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
