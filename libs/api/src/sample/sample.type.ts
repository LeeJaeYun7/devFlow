import { ApiProperty } from '@nestjs/swagger';

export class Sample {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: Number })
  numData!: number;
}
