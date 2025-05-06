import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatModel, ChatSchema } from '../../../module/mongo/model/chat.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatModel.name, schema: ChatSchema }
    ])
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService]
})
export class ChatModule {}
