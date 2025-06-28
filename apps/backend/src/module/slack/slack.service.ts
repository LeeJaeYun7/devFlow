import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly webhookUrl: string;

  constructor() {
    if (process.env['NODE_ENV'] === 'production') {
      this.webhookUrl = '';
    } else {
      this.webhookUrl = '';
    }
  }

  public async send(body: SlackMessageBody) {
    await this.sendToSlack(body);
  }

  public async sendMessage(message: string) {
    const body: SlackMessageBody = {
      text: ':information_source: 새로운 메시지가 도착했습니다.',
      attachments: [
        {
          color: '#36a2ef', // 파란색 계열
          title: 'Message',
          text: message,
        },
      ],
    };

    await this.sendToSlack(body);
  }

  public async sendError(error: Error, message?: string) {
    const stackLines = error.stack ? error.stack.split('\n') : [];
    const mainErrorLine = stackLines.shift() || '';
    const formattedStack = stackLines.length ? stackLines.map((line) => `${line.trim()}`).join('\n') : 'No stack trace';

    const body: SlackMessageBody = {
      text: `❗ *${error.name}* - *${error.message}*`,
      attachments: [
        ...(message
          ? [
              {
                color: '#ffcc00',
                title: 'Error Message',
                text: `*${message}*`,
              },
            ]
          : []),
        {
          color: '#cccccc',
          title: 'Stack Trace',
          text: `*${mainErrorLine}*\n\`\`\`\n${formattedStack}\n\`\`\``,
        },
      ],
    };

    await this.sendToSlack(body);
  }

  private async sendToSlack(body: SlackMessageBody) {
    if (!this.webhookUrl) {
      return;
    }

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }).then((res) => res.text());
    } catch (error) {
      this.logger.error(`Failed to send message to Slack ${error}`);
    }
  }
}

interface SlackMessageBody {
  text: string;
  attachments?: SlackAttachment[];
}

interface SlackAttachment {
  color: string;
  title: string;
  text: string;
  fields?: SlackField[];
}

interface SlackField {
  title: string;
  value: string;
  short: boolean;
}
