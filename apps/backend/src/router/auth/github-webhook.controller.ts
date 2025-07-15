import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../../common/decorator/public.decorator';

@ApiTags('GitHub Webhook')
@Public()
@Controller('/webhook/github')
export class GithubWebhookController {
  @Post()
  public async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const event = req.headers['x-github-event'] as string;
      const payload = req.body;

      console.log('GitHub Webhook Event:', event);
      console.log('GitHub Webhook Payload:', payload);

      // 여기서 GitHub 이벤트를 처리할 수 있습니다
      // 예: 저장소 푸시, 이슈 생성, PR 생성 등

      res.status(HttpStatus.OK).json({ message: 'Webhook received successfully' });
    } catch (error) {
      console.error('GitHub Webhook Error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Webhook processing failed' });
    }
  }
}