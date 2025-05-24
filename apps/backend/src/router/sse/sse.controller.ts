import { Controller, Sse, Res, MessageEvent } from '@nestjs/common';
import type { Response } from 'express';
import { SseService } from './sse.service';
import { Subject } from 'rxjs';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse()
  async handleSse(@Res() res: Response): Promise<Subject<MessageEvent>> {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    return this.sseService.connect(res);
  }
}
