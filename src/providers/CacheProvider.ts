import { Container, Service } from 'typedi';
import winston from 'winston';
import  Redis  from 'ioredis';

import { Logger } from '@Decorators/Logger';

import { env } from '@Libs/env';
import ServiceProvider from '@Libs/provider/ServiceProvider';

@Service()
export default class CacheProvider extends ServiceProvider {
  private cache: Redis.Redis;

  constructor(@Logger(module) private logger: winston.Logger) {
    super();
  }

  async register(): Promise<void> {
    this.cache = new Redis(env.redis.nodes, {
      retryStrategy(times: number) {
        return Math.min(times * 50, 2000);
      },
    });

    this.cache.on('connect', () => {
      this.logger.info('Redis connecting!');
    });
    this.cache.on('ready', () => {
      this.logger.info('Redis ready!');
    });
    this.cache.on('close', () => {
      this.logger.info('Redis closing!');
    });

    Container.set('cache', this.cache);
  }

  async close() {
    this.logger.info('Redis disconnecting!');
    this.cache.disconnect(false);
  }
}
