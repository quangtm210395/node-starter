import  Redis  from 'ioredis';
import { Inject, Service } from 'typedi';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { env } from '@Libs/env';

import { JSONParseError } from '@Errors/JSONParseError';

import { ConfigRepository } from '@Repositories/ConfigRepository';

@Service()
export class ConfigService {
  constructor(
    @Logger(module) private readonly logger: winston.Logger,
    @Inject('cache') private readonly cache: Redis.Redis,
    private readonly configRepo: ConfigRepository,
  ) {}

  /**
   * get the config as a string
   * @param key the config key
   * @returns value as a string
   */
  async getByKey(key: string) {
    let v = await this.cache.get(key);
    if (!v) {
      const value = await this.configRepo.get(key);
      if (value) {
        v = value?.value;
        await this.cache.setex(key, env.redis.defaultExpirationTimeInSeconds || 300, v);
      }
    }
    return v;
  }

  /**
   * get multiple configs by multiple keys
   * @param keys the multiple config keys
   * @param hashTag Hash tag to ensure that multiple keys are allocated in the same hash slot
   * @returns returns an array of string values
   */
  async getByMultiKeys(keys: string[], hashTag: string) {
    //We will first try to get all the values ​​corresponding to each key
    //Then we will query the db to get the values ​​of the keys that are not found in the cache
    const results = new Array(keys.length).fill(null);
    const values = await this.cache.mget(keys.map(key => `{${hashTag}}${key}`));
    //We use an object as a hashmap to query the index of a key that does not exist in the cache
    //To return the correctly indexed array of values
    const keysNotFound = {};
    values.forEach((v, idx) => {
      if (v) {
        results[idx] = v;
      } else {
        keysNotFound[keys[idx]] = idx;
      }
    });
    keys = Object.keys(keysNotFound);
    if (keys.length > 0) {
      const values = await this.configRepo.getByMultiKeys(keys);
      //Aggregate result
      await this.cache
        .pipeline(
          values.map(v => {
            results[keysNotFound[v.key]] = v.value;
            if (v.value) {
              return ['setex', `{${hashTag}}${v.key}`, (env.redis.defaultExpirationTimeInSeconds || 300).toString(), v.value];
            }
          }),
        )
        .exec();
    }
    return results;
  }

  /**
   * get the config data and convert to number
   * @param key the config key
   * @returns value as a number
   */
  async getDateByKey(key: string) {
    const value = await this.getByKey(key);
    return typeof value === 'string' ? new Date(value) : null;
  }

  /**
   * get the config data and convert to number
   * @param key the config key
   * @returns value as a number
   */
  async getNumberByKey(key: string) {
    const value = await this.getByKey(key);
    return typeof value === 'string' ? Number(value) : null;
  }

  /**
   * get the config data and convert to object
   * @param key the config keys
   * @returns value as a json object
   */
  async getJSONByKey(key: string) {
    const value = await this.getByKey(key);
    try {
      const data = JSON.parse(value);
      return data;
    } catch (error) {
      this.logger.error(`getJSONByKey error, key: ${key}, value: ${value} `, error);
      throw new JSONParseError();
    }
  }

  /**
   * get the config data and convert to an array
   * @param key the config key
   * @returns value as an array of
   */
  async getArrayByKey(key: string) {
    const value = await this.getByKey(key);
    return value.split(',');
  }

  async expireConfigs(prefix?: string) {
    const keys = await this.cache.keys(`${prefix || ''}*`);
    this.logger.info('expireConfigs keys: ', keys);
    for (let key of keys) {
      await this.cache.del(key);
    }
    return keys;
  }

  async keys(prefix?: string) {
    const keys = await this.cache.keys(`${prefix || ''}*`);
    return keys;
  }

  async setByKey(key: string, value: string) {
    const v = await this.configRepo.upsert(key, value);
    if (v) {
      const vv = v?.value;
      await this.cache.setex(key, env.redis.defaultExpirationTimeInSeconds || 300, vv);
    }
  }

  async setCache(key: string, value: string) {
    return this.cache.setex(key, env.redis.defaultExpirationTimeInSeconds || 300, value);
  }

  async getCache(key: string) {
    return this.cache.get(key);
  }
}
