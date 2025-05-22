import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomRequestContextService } from '../../module/custom_request_context/custom_request_context.service';
import { CustomRequestContext } from '../../module/custom_request_context/custom_request_context.type';
import { JwtService } from '@nestjs/jwt';
import { SsoUser } from '../../router/auth/auth.type';
@Injectable()
export class CustomRequestContextMiddleware implements NestMiddleware {
  constructor(
    private readonly customRequestContextService: CustomRequestContextService,
    private readonly jwtService: JwtService
  ) {}

  public use(req: Request, res: Response, next: NextFunction) {
    const context: Partial<CustomRequestContext> = {};

    try {
      const accessToken = this.extractTokenFromHeader(req);
      const decoded = this.jwtService.verify<SsoUser>(accessToken ?? '');
      context.user = decoded;
    } catch {
      // do nothing
    }

    this.customRequestContextService.run(context as CustomRequestContext, () => {
      next();
    });
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const cookieAuthorization = request.cookies.authorization;
    if (cookieAuthorization) {
      return cookieAuthorization;
    }

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
