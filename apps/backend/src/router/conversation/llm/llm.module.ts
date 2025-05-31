import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { YahooFinanceModule } from '../../finance/yahoo/yahoo-finance.module';
import { NaverFinanceModule } from '../../finance/naver/naver-finance.module';
import { OpenRouterService } from './open_router/open_router.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModel, MessageSchema } from '../../../module/mongo/model/conversation/models/message.model';
import { ParserService } from './parser.service';
import { SystemCharacterModel, SystemCharacterSchema } from '../../../module/mongo/model/system_character.model';
import { SystemModelModel, SystemModelSchema } from '../../../module/mongo/model/system_model.model';

@Module({
  imports: [
    YahooFinanceModule,
    NaverFinanceModule,
    MongooseModule.forFeature([{ name: MessageModel.name, schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: SystemCharacterModel.name, schema: SystemCharacterSchema }]),
    MongooseModule.forFeature([{ name: SystemModelModel.name, schema: SystemModelSchema }]),
  ],
  providers: [LlmService, OpenRouterService, ParserService],
  exports: [LlmService],
})
export class LlmModule {}
