import { Request, Response, NextFunction } from 'express';
import  Redis  from 'ioredis';

import { env } from '@Libs/env';
import { verify } from '@Libs/jwt';
import { WinstonLogger } from '@Libs/WinstonLogger';
import { GraphqlReqCredentials } from '@Libs/types/GraphqlReqCredentials';

const logger = WinstonLogger.create(module);

export function authenticate(cache: Redis.Redis) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req?.body?.query?.trim?.().startsWith?.('query Introspection')) {
      (req as any).isIntrospection = true;
      return next();
    }
    const [, token] = (req.headers.authorization || '').split(' ');
    if (!token) {
      return next();
    }
    try {
      const data: any = verify(token, env.graphqlJwt.publicKey);
      logger.info('authenticate:: Decoded token data: ', data);
      const val = await cache.get((data.sub as string));
      if (!val || val !== data['tokenType']) {
        logger.warn('authenticate:: invalid token: ', data.sub);
        return next();
      }
      const credentials: GraphqlReqCredentials = {
        sub: data.sub as string,
        payload: data,
      };
      (req as any).credentials = credentials;
      return next();
    } catch (error) {
      logger.error('authenticate:: Error verifying token: ', error);
      return next();
    }
  };
}
