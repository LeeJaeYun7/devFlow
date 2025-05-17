import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse, CreatePaginationResponseData, OffsetPaginationDto } from '../../types';

export class ChatListDto extends OffsetPaginationDto {}

class ChatItem {
  @ApiProperty({ description: '채팅 ID' })
  chatId!: string;

  @ApiProperty({ description: '채팅 제목' })
  title!: string;
}

class ChatListResponseData extends CreatePaginationResponseData(ChatItem) {}

export class ChatListResponse extends BaseResponse {
  @ApiProperty({ type: ChatListResponseData })
  data!: ChatListResponseData;
}
