import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageModel, MessageSchema } from '../../../module/mongo/model/message.model';
import { LlmModule } from '../llm/llm.module';
import { FinanceModule } from '../../finance/finance.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: MessageModel.name, schema: MessageSchema }]), LlmModule, FinanceModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
