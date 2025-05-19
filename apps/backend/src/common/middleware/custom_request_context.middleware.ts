import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomRequestContextService } from '../../module/custom_request_context/custom_request_context.service';
import { CustomRequestContext } from '../../module/custom_request_context/custom_request_context.type';

@Injectable()
export class CustomRequestContextMiddleware implements NestMiddleware {
  constructor(private readonly customRequestContextService: CustomRequestContextService) {}

  public use(req: Request, res: Response, next: NextFunction) {
    const context = {
      user: req.user,
    } satisfies CustomRequestContext;

    this.customRequestContextService.run(context, () => {
      next();
    });
  }
}
