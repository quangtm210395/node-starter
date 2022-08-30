import { Request, Response, NextFunction } from 'express';
import { ExpressMiddlewareInterface, Middleware, UnauthorizedError } from 'routing-controllers';
import winston from 'winston';
import { Service } from 'typedi';

import { Logger } from '@Decorators/Logger';

import { env } from '@Libs/env';
import { verify } from '@Libs/jwt';
import { WinstonLogger } from '@Libs/WinstonLogger';

const logger = WinstonLogger.create(module);

@Service()
@Middleware({ type: 'before' })
export class AuthenticationMiddleware implements ExpressMiddlewareInterface {
  constructor(@Logger(module) private logger: winston.Logger) {}

  public use(req: Request, res: Response, next: NextFunction): void {
    if (req.path.includes('/graphql')) {
      return next();
    }
    const [, token] = (req.headers.authorization || '').split(' ');
    if (!token) return next();
    // logger.info('AuthenticationMiddleware:: Token in request: ', token);
    try {
      const data: any = verify(token, env.jwt.publicKey);
      // logger.info('AuthenticationMiddleware:: Decoded token data: ', data);
      (req as any).identity = data.sub;
      (req as any).roles = data['roles'] || [];
      return next();
    } catch (error) {
      logger.error('AuthenticationMiddleware:: Error verifying token: ', error);
      throw new UnauthorizedError();
    }
  }
}
