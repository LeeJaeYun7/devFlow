import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SlackService } from '../../module/slack/slack.service';
import { SystemError, UserError } from '../../util/base.error';
import { HttpAdapterHost } from '@nestjs/core';
import { BaseResponse } from '@lia/api/types/base.type';

@Catch()
export class BaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BaseExceptionFilter.name);

  constructor(
    private readonly slackService: SlackService,
    private readonly httpAdapterHost: HttpAdapterHost
  ) {}

  public catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      this.sendResponse(response, exception.getStatus(), exception.message);
      return;
    }

    if (exception instanceof UserError) {
      this.sendResponse(response, exception.statusCode, exception.message);
      return;
    }

    if (exception instanceof SystemError) {
      this.slackService.sendError(exception, `[${request.method}] ${request.url}`);
      this.logger.fatal(`[${request.method}] ${request.url} ${exception.message}`, exception.stack);
      this.sendResponse(response, exception.statusCode, exception.message);
      return;
    }

    if (exception instanceof Error) {
      this.slackService.sendError(exception, `[${request.method}] ${request.url}`);
      this.logger.error(`[${request.method}] ${request.url} ${exception.message}`, exception.stack);
      this.sendResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
      return;
    }

    this.logger.error(`[${request.method}] ${request.url}`, exception);
    this.sendResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Unknown Server Error');
  }

  private sendResponse(response: Response, statusCode: number, message: string) {
    const responseBody: BaseResponse = {
      statusCode,
      message,
    };

    this.httpAdapterHost.httpAdapter.reply(response, responseBody, statusCode);
  }
}
