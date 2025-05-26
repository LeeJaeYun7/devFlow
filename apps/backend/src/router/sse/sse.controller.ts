import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { SseService } from './sse.service';
import { Subject } from 'rxjs';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse()
  async handleSse(): Promise<Subject<MessageEvent>> {
    return this.sseService.connect();
  }
}
