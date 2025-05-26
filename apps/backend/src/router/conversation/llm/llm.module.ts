import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { YahooFinanceModule } from '../../finance/yahoo/yahoo-finance.module';
import { OpenRouterService } from './open_router/open_router.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModel, MessageSchema } from '../../../module/mongo/model/conversation/models/message.model';

@Module({
  imports: [YahooFinanceModule, MongooseModule.forFeature([{ name: MessageModel.name, schema: MessageSchema }])],
  providers: [LlmService, OpenRouterService],
  exports: [LlmService],
})
export class LlmModule {}
