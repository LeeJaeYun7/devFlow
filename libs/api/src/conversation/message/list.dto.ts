import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { BaseResponse, CreatePaginationResponseData, OffsetPaginationDto } from '../../types';

export class MessageListDto extends OffsetPaginationDto {
  @ApiProperty({ description: '채팅방 ID' })
  @IsMongoId()
  @IsNotEmpty()
  chatId!: string;
}

class MessageItem {
  @ApiProperty({ description: '메시지 ID' })
  id!: string;

  @ApiProperty({ description: '메시지 내용' })
  content!: string;

  @ApiProperty({ description: '메시지 역할' })
  role!: string;

  @ApiProperty({ description: '생성 시각' })
  createdAt!: Date;
}

class MessageListResponseData extends CreatePaginationResponseData(MessageItem) {}

export class MessageListResponse extends BaseResponse {
  @ApiProperty({ type: MessageListResponseData })
  data!: MessageListResponseData;
}
