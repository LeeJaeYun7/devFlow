import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomRequestContextService } from '../../module/custom_request_context/custom_request_context.service';
import { CustomRequestContext } from '../../module/custom_request_context/custom_request_context.type';
@Injectable()
export class CustomRequestContextMiddleware implements NestMiddleware {
  constructor(private readonly customRequestContextService: CustomRequestContextService) {}

  public use(req: Request, res: Response, next: NextFunction) {
    const context: Partial<CustomRequestContext> = {};

    try {
      const session = req.session;
      context.user = session.user;
    } catch {
      // do nothing
    }

    this.customRequestContextService.run(context as CustomRequestContext, () => {
      next();
    });
  }
}
