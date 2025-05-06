import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ClassConstructor } from 'class-transformer';

export class OffsetPaginationDto {
  @ApiProperty({ description: '페이지 번호', required: false, default: 1, type: Number })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page = 1;

  @ApiProperty({ description: '페이지 당 아이템 수', required: false, default: 20, type: Number })
  @IsNumber()
  @IsOptional()
  @Max(100)
  @Min(1)
  limit = 20;
}

class PaginationMeta {
  @ApiProperty({ description: '총 아이템 수' })
  total!: number;

  @ApiProperty({ description: '총 페이지 수' })
  totalPages!: number;
}

export function CreatePaginationResponseData<T>(DataClass: ClassConstructor<T>) {
  class PaginationResponseData {
    @ApiProperty({ type: DataClass, isArray: true })
    data!: T[];

    @ApiProperty({ type: PaginationMeta })
    meta!: PaginationMeta;
  }

  return PaginationResponseData;
}
