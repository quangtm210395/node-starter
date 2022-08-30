import DataLoader, { CacheMap } from 'dataloader';
import { Container, Constructable } from 'typedi';
import { Request, Response } from 'express';
import { UnauthorizedError } from 'type-graphql';
import  Redis  from 'ioredis';
import TTLCache from '@isaacs/ttlcache';

import { WinstonLogger } from '@Libs/WinstonLogger';
import { GraphqlReqCredentials } from '@Libs/types/GraphqlReqCredentials';
import { verify } from '@Libs/jwt';
import { env } from '@Libs/env';
import { GraphqlContext } from '@Libs/types/GraphqlContext';

const logger = WinstonLogger.create(module);
export interface CreateDataLoaderOptions<K, V> {
  method?: string;
  key?: string;
  multiple?: boolean;
  cacheMap?: CacheMap<K, Promise<V>>;
}

/**
 * Creates a new dataloader with the repository
 */
export function createDataLoader<S, K, V>(
  serviceType: Constructable<S>,
  options: CreateDataLoaderOptions<K, V> = {},
): DataLoader<any, any> {
  let service: S;
  const cacheMap = options.cacheMap ?? new TTLCache({ max: env.dataloaderCache.max,
    ttl: env.dataloaderCache.ttlInMilliseconds });
  try {
    service = Container.get(serviceType);
  } catch (errorRepo) {
    throw new Error('Could not create a dataloader, because serviceType is not a service!');
  }

  return new DataLoader<any, any>(async (keys: any[]) => {
    let items = [];
    try {
      if (options.method) {
        items = await service[options.method](keys);
      } else {
        items = await service['findByIds'](keys);
      }
    } catch (error) {
      items = [];
    }

    const handleBatch = (arr: any[]) => (options.multiple === true ? arr : arr[0]);
    const k = keys.map(key => handleBatch(items.filter(item => {
      return item[options.key || 'id'] === key || item[options.key || 'id']?.toHexString?.() === key;
    })));
    return k;
  }, { cacheMap: cacheMap });
}

export const createReqContext = async (req: Request, res: Response, cache: Redis.Redis): Promise<GraphqlContext> => {
  const [, token] = (req.headers.authorization || '').split(' ');
  if (!token) {
    return { req, res };
  }
  try {
    const data: any = verify(token, env.graphqlJwt.publicKey);
    logger.info('createReqContext:: Decoded token data: ', data);
    const val = await cache.get((data.sub as string));
    if (!val || val !== data['tokenType']) {
      logger.warn('createReqContext:: invalid token: ', data.sub);
      throw new UnauthorizedError();
    }
    const credentials: GraphqlReqCredentials = {
      sub: data.sub as string,
      payload: data,
    };
    return { req, res, credentials };
  } catch (error) {
    logger.error('createReqContext:: Error verifying token: ', error);
    throw new UnauthorizedError();
  }
};
