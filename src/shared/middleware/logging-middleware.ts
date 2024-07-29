import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const body = JSON.stringify(req.body);
    const startTime = Date.now();

    this.logger.log(`-> Request: ${method} ${originalUrl} - Body: ${body}`);

    res.on('finish', () => {
      const { statusCode } = res;
      const elapsedTime = Date.now() - startTime;
      this.logger.log(
        `<- Response: ${method} ${originalUrl} ${statusCode} - ${elapsedTime}ms`,
      );
    });

    next();
  }
}
