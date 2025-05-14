import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmBasicService } from './basic.service';
import { FunctionCallingService } from './function_calling.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModel, MessageSchema } from '../../../module/mongo/model/message.model';
import { FunctionGetStockPriceStrategy } from './function_calling/get_stock_price_strategy';

@Module({
  imports: [MongooseModule.forFeature([{ name: MessageModel.name, schema: MessageSchema }])],
  providers: [LlmService, LlmBasicService, FunctionCallingService, FunctionGetStockPriceStrategy],
  exports: [LlmService],
})
export class LlmModule {}
