import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  private getIp(request: Request): string {
    const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;

    if (ip && ip.includes(',')) {
      if (typeof ip === 'string') {
        return ip.split(',')[0].trim();
      } else {
        return ip[0].trim();
      }
    }

    if (ip === '::1') {
      return '127.0.0.1';
    }

    if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
      return ip.slice(7);
    }

    return ip as string;
  }

  public use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const ip = this.getIp(req);
      const method = req.method;
      const url = req.originalUrl;
      const statusCode = res.statusCode;

      this.logger.verbose(`${ip} - ${method} ${statusCode} ${url} (${duration}ms)`);
    });

    next();
  }
}
