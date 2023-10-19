import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';
import { Service } from 'typedi';

import { Logger } from '@Decorators/Logger';

@Service()
@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  constructor(@Logger(module) private logger: winston.Logger) {}

  public error(error: any, req: Request, res: Response, next: NextFunction) {
    this.logger.error(`error mdw:: ${error.name}`, { err: error });
    // if (error instanceof BusinessLogicError) {
    //   return res.status(error.httpCode || 500).json({
    //     name: error.name,
    //     message: error.message,
    //     errors: [error],
    //   });
    // }
    return res.status(error.httpCode || 500).json({
      name: error.name,
      message: error.message,
      errors: error.errors,
    });
  }
}
