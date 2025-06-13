import { MessageRole, MessageRoleMap } from '@lia/api/conversation/message/message.constant';
import { MessageModel } from '../../../module/mongo/model/conversation/models/message.model';

export class ChatFlowManager {
  public readonly chatId: string;
  public readonly newMessages: Partial<MessageModel>[];
  public readonly llmModel: string;

  private isUsingFunctionCall: boolean;

  constructor({ chatId, userMessage, llmModel }: ChatFlowManagerParam) {
    this.chatId = chatId;
    this.newMessages = [];
    this.isUsingFunctionCall = false;
    this.llmModel = llmModel;

    this.addMessage(userMessage, MessageRoleMap.user);
  }

  public addMessage(content: string | null, role: MessageRole) {
    if (!content) return;
    this.newMessages.push({
      chatId: this.chatId,
      content,
      role,
      createdAt: new Date(),
    });
  }

  public useFunctionCall() {
    this.isUsingFunctionCall = true;
  }

  public getChatFlow() {
    return {
      chatId: this.chatId,
      newMessages: this.newMessages,
      isUsingFunctionCall: this.isUsingFunctionCall,
      llmModel: this.llmModel,
    };
  }

  public static createInstance(param: ChatFlowManagerParam) {
    return new ChatFlowManager(param);
  }
}

interface ChatFlowManagerParam {
  chatId: string;
  userMessage: string;
  llmModel: string;
}
