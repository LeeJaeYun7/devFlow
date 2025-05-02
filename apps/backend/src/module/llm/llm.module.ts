import { Module } from '@nestjs/common';
import { LlmBasicService } from './basic.service';
import { FunctionCallingService, FunctionCallingStrategyList } from './function_calling.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModel, MessageSchema } from '../mongo/model/message.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: MessageModel.name, schema: MessageSchema }])],
  providers: [LlmBasicService, FunctionCallingService, ...FunctionCallingStrategyList],
  exports: [LlmBasicService],
})
export class LLMModule {}
