import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject } from 'rxjs';
import { CustomRequestContextService } from '../../module/custom_request_context/custom_request_context.service';

@Injectable()
export class SseService {
  private readonly clients = new Map<string, Subject<MessageEvent>>();
  constructor(private readonly contextService: CustomRequestContextService) {}

  public connect() {
    const user = this.contextService.get('user');
    const userId = user.id;

    if (this.clients.has(userId)) {
      return this.clients.get(userId)!;
    }

    const subject = new Subject<MessageEvent>();
    this.clients.set(userId, subject);
    return subject;
  }

  public sendEvent(event: MessageEvent): void {
    const user = this.contextService.get('user');
    const userId = user.id;

    const client = this.clients.get(userId);
    if (client) {
      client.next(event);
    }
  }
}
