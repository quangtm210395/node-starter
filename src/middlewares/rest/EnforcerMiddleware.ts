import { NextFunction, Response } from 'express';
import { ExpressMiddlewareInterface } from 'routing-controllers';
import winston from 'winston';
import { Inject, Service } from 'typedi';
import { Alohomora, AlohomoraRequest } from '@hikariq/alohomora';

import { Logger } from '@Decorators/Logger';

@Service()
export class EnforcerMiddleware implements ExpressMiddlewareInterface {
  constructor(
    @Logger(module) private logger: winston.Logger,
    @Inject('keycloak') private readonly keycloak: Alohomora,
  ) {}

  public use(req: AlohomoraRequest, res: Response, next: NextFunction) {
    this.logger.info('route: ', req.route?.path, req.method);
    return this.keycloak.enforce().apply(null, [req, res, next]);
  }
}
