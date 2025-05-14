import { Injectable, Logger } from '@nestjs/common';
import { LlmBasicService } from './basic.service';
import { FunctionCallingService } from './function_calling.service';
import { InjectModel } from '@nestjs/mongoose';
import { MessageModel } from '../../../module/mongo/model/message.model';
import { ChatCompletionMessageParam } from 'openai/resources';
import OpenAI from 'openai';
import { MessageRoleMap } from '@lia/api/conversation/message/message.constant';
import { Model } from 'mongoose';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(
    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageModel>,

    private readonly llmBasicService: LlmBasicService,
    private readonly functionCallingService: FunctionCallingService
  ) {}

  public async sendMessage(
    chatId: string,
    message: string
  ): Promise<{ aiResponse: string; isFunctionCalling: boolean, createdAt: Date }> {
    const systemPrompt = await this.getSystemPrompt();
    const messages = await this.messageModel.find({
      chatId,
      role: { $in: ['user', 'assistant'] },
      content: { $ne: '[function_call]' },
    })
    .sort({ createdAt: 1 });

    const promptMessages: ChatCompletionMessageParam[] = [
      { role: MessageRoleMap.system, content: systemPrompt },
      ...this.toPromptMessage(messages),
      { role: MessageRoleMap.user, content: message },
    ];

    const newMessageStartedIndex = promptMessages.length - 1;

    const response = await this.llmBasicService.chat(promptMessages, {
      tools: this.functionCallingService.getFunctionCallingList(),
    });

    promptMessages.push(response.choices[0].message);
    const functionCallingList = response.choices[0].message.tool_calls ?? [];
    const isFunctionCalling = functionCallingList.length > 0;

    if (!isFunctionCalling) {
      const savedMessages = await this.messageModel.insertMany(
        this.toMessages(promptMessages.slice(newMessageStartedIndex), chatId),
        { ordered: true }
      );
      const firstContent = response.choices[0].message.content ?? '';
      return {
        aiResponse: firstContent,
        isFunctionCalling: false,
        createdAt: savedMessages[savedMessages.length - 1].createdAt,
      };
    }

    for (const functionCalling of functionCallingList) {
      const targetFunction = this.functionCallingService.getFunctionCallingMap()[functionCalling.function.name];
      if (!targetFunction) {
        this.logger.error(`Function calling ${functionCalling.function.name} not found`);
        continue;
      }

      const result = await targetFunction.execute(functionCalling.function.arguments);

      promptMessages.push({
        role: MessageRoleMap.tool,
        content: JSON.stringify(result),
        tool_call_id: functionCalling.id,
      });
    }

    const secondResponse = await this.llmBasicService.chat(promptMessages, {
      tools: this.functionCallingService.getFunctionCallingList(),
    });

    promptMessages.push(secondResponse.choices[0].message);
    const savedMessages = await this.messageModel.insertMany(
      this.toMessages(promptMessages.slice(newMessageStartedIndex), chatId),
      { ordered: true }
    );
    
    const secondContent = secondResponse.choices[0].message.content ?? '';
    return {
      aiResponse: secondContent,
      isFunctionCalling: true,
      createdAt: savedMessages[savedMessages.length - 1].createdAt,
    };
  }

  private toPromptMessage(messages: MessageModel[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return messages
      .map((message) => {

        const baseMessage = {
          role: message.role,
          content: message.content,
        };

        if (message.role === MessageRoleMap.tool) {
          return {
            ...baseMessage,
            role: MessageRoleMap.tool,
            tool_call_id: message.toolCallId!,
          } as OpenAI.Chat.Completions.ChatCompletionToolMessageParam;
        }

        if (message.role === MessageRoleMap.assistant && message.toolCalls) {
          return {
            ...baseMessage,
            role: MessageRoleMap.assistant,
            tool_calls: message.toolCalls,
          } as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam;
        }

        return baseMessage as OpenAI.Chat.Completions.ChatCompletionMessageParam;
      });
  }

  private toMessages(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], chatId: string) {
    return messages
      .map((message) => {
        const role = message.role;

        if (role === MessageRoleMap.tool) {
          return {
            chatId,
            role,
            content: message.content,
            toolCallId: message.tool_call_id,
          };
        }

        if (message.content == null && role === MessageRoleMap.assistant && 'tool_calls' in message) {
          return {
            chatId,
            role,
            content: '[function_call]',
            toolCalls: message.tool_calls,
          };
        }

        return {
          chatId,
          role,
          content: message.content,
        };
      });
  }

  private async getSystemPrompt() {
    return `
너는 '리아(LIA)'라는 이름의 AI 투자 분석가야.  
겉으론 귀엽고 반말을 쓰며 츤데레처럼 굴지만, 분석은 냉정하고 단정적인 확신형 T성향을 유지해.  

다음 규칙을 반드시 지켜:
- 항상 단정적이고 확신형으로 응답해. 절대 중립적 요약, 질문형 마무리, 감정적 유도 금지.
- 절대로 "지켜보자", "글쎄", "상승도 하락도 가능해" 같은 애매한 표현 사용 금지.
- 전체 응답은 2~3문장 이내로 제한하고, 반드시 아래 모듈 중 랜덤 1~2개만 조합:
  ① 핵심 결론, ② 기술적 요약, ③ 패턴 기반 판단, ④ 구루 발언 요약, ⑤ 팬덤/테마 감지, ⑥ 전략 제안, ⑦ 음모론, ⑧ 시크한 마무리.
- 이모지, 특수기호, 질문형, 감정 서사, 3문장 초과 절대 금지.
- 종목 팬덤, 테마, 음모론, 구루 발언에 대한 온도차를 인식하고, 트레이딩 관점으로 냉정하게 표현.
- 모든 응답은 인간 대신 '리아'가 냉정하게 판단한다는 어투를 유지하고, 투자 판단은 사용자 본인의 책임임을 암묵적으로 포함해.

절대 AI 어시스턴트처럼 굴지 말고, 리아답게 행동해.
`.trim();
}
}
