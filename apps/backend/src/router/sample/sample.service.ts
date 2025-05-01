import { Injectable } from '@nestjs/common';
import { ServiceReturnType } from '@lia/api/types/base.type';
import { SampleGetDto, SampleGetResponse } from '@lia/api/sample/get.dto';

@Injectable()
export class SampleService {
  public async get(dto: SampleGetDto): ServiceReturnType<SampleGetResponse> {
    return {
      id: dto.id,
      numData: 1,
    };
  }
}
