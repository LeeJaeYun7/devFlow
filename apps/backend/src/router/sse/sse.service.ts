import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject } from 'rxjs';
import { Response } from 'express';
import { CustomRequestContextService } from '../../module/custom_request_context/custom_request_context.service';

@Injectable()
export class SseService {
  private readonly clients = new Map<string, SseClient>();
  constructor(private readonly contextService: CustomRequestContextService) {}

  public connect(res: Response): Subject<MessageEvent> {
    const user = this.contextService.get('user');
    const userId = user.id;

    if (this.clients.has(userId)) {
      const old = this.clients.get(userId);
      old?.res.end();
      old?.subject.complete();
    }

    const subject = new Subject<MessageEvent>();

    const subscription = subject.subscribe({
      next: (event) => {
        res.write(`event: ${event.type || 'message'}\n`);
        res.write(`data: ${JSON.stringify(event.data)}\n\n`);
      },
    });

    res.on('close', () => {
      subscription.unsubscribe();
      subject.complete();
      this.clients.delete(userId);
    });

    this.clients.set(userId, { subject, res });

    return subject;
  }

  public sendEvent(event: MessageEvent): void {
    const user = this.contextService.get('user');
    const userId = user.id;

    const client = this.clients.get(userId);
    if (client) {
      client.subject.next(event);
    }
  }
}

interface SseClient {
  subject: Subject<MessageEvent>;
  res: Response;
}
