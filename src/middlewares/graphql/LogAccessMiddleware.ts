import { MiddlewareInterface, NextFn, ResolverData } from 'type-graphql';
import winston from 'winston';
import { Service } from 'typedi';

import { Logger } from '@Decorators/Logger';

@Service()
export class LogAccess implements MiddlewareInterface<any> {
  constructor(@Logger(module) private readonly logger: winston.Logger) {}

  async use({ context, info }: ResolverData<any>, next: NextFn) {
    if (['Query', 'Mutation'].includes(info.parentType.name)) {
      const { req, user } = context;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const username: string = user?.address || 'guest';
      this.logger.info(`Logging access: ${username} from ${ip} -> ${info.parentType.name}.${info.fieldName}`);
    }
    return next();
  }
}
