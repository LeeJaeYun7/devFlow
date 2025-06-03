import { Injectable } from '@nestjs/common';
import { OpenRouterMessage } from './open_router/open_router.type';
import { InjectModel } from '@nestjs/mongoose';
import { MessageModel } from '../../../module/mongo/model/conversation/models/message.model';
import { Model } from 'mongoose';
import { MessageRoleMap } from '@lia/api/conversation/message/message.constant';
import { SystemCharacterModel } from '../../../module/mongo/model/system_character.model';
import { LlmChatFlowService } from './llm_chat_flow.service';
@Injectable()
export class LlmService {
  constructor(
    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageModel>,

    @InjectModel(SystemCharacterModel.name)
    private readonly systemCharacterModel: Model<SystemCharacterModel>,
    private readonly llmChatFlowService: LlmChatFlowService
  ) {}

  public async getAnalysisStream({ chatId, message, cb, endCb, titleParam }: LLMAnalysisStreamParam) {
    const systemPrompt = await this.systemCharacterModel.findOne({ name: 'Lia' }).lean();

    const messages = await this.messageModel
      .find({
        chatId,
        role: { $in: [MessageRoleMap.user, MessageRoleMap.assistant] },
      })
      .sort({ createdAt: -1 })
      .limit(10);

    if (messages.length === 0) {
      await this.llmChatFlowService.handleTitleStream({
        message,
        cb: titleParam?.cb,
        endCb: titleParam?.endCb,
      });
    }

    const newMessages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt?.systemPrompt || '' },
      ...messages.map((v) => ({ role: v.role, content: v.content })),
      { role: 'user', content: message },
    ];

    await this.llmChatFlowService.handleMessageStream(newMessages, chatId, cb, endCb);
  }
}
interface LLMStreamParam {
  message: string;
  cb: (content: string) => void;
  endCb: (finalContent: string) => Promise<void>;
}

interface LLMAnalysisStreamParam extends LLMStreamParam {
  chatId: string;
  titleParam: Omit<LLMStreamParam, 'message'>;
}
