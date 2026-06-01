import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || '0';
      const responseTime = Date.now() - startTime;

      const statusEmoji = statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️' : statusCode >= 300 ? '↪️' : '✅';
      const methodColor = this.getMethodColor(method);
      
      const logMessage = `${statusEmoji} ${methodColor}${method}\x1b[0m ${originalUrl} \x1b[90m${statusCode}\x1b[0m ${responseTime}ms`;
      
      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }

  private getMethodColor(method: string): string {
    const colors: Record<string, string> = {
      GET: '\x1b[36m',    // Cyan
      POST: '\x1b[32m',   // Green
      PUT: '\x1b[33m',    // Yellow
      PATCH: '\x1b[33m',  // Yellow
      DELETE: '\x1b[31m',  // Red
    };
    return colors[method] || '\x1b[37m'; // White
  }
}

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const middleware = new LoggerMiddleware();
  middleware.use(req, res, next);
}
