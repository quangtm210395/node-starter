import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';

import { Logger } from '@Decorators/Logger';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  constructor(@Logger(module) private logger: winston.Logger) {}

  public error(error: HttpError, req: Request, res: Response, next: NextFunction): void {
    res.status(error.httpCode || 500);
    res.json({
      errors: [error],
    });

    this.logger.error(`error mdw:: ${error.name}`, error);
  }
}
