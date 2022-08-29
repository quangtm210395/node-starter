import { ForbiddenError, MiddlewareFn, UnauthorizedError } from 'type-graphql';

import { WinstonLogger } from '@Libs/WinstonLogger';
import { GraphqlContext } from '@Libs/types/GraphqlContext';

const logger = WinstonLogger.create(module);

export function HasRoles(roles: any[]): MiddlewareFn<GraphqlContext> {
  return async ({ context }, next) => {
    const { credentials, res } = context;
    logger.info('HasRole:: credentials: ', credentials);
    if (!credentials) {
      throw new UnauthorizedError();
    }
    if (roles && roles.length) {
      const r: string[] = credentials.payload['roles'] || [];
      if (!roles.find(role => r.indexOf(role.toString()) !== -1)) {
        throw new ForbiddenError();
      }
    }
    return next();
  };
}
