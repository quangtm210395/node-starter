import 'reflect-metadata';

import http from 'http';
import path from 'path';

import  Redis  from 'ioredis-mock';
import { Container } from 'typedi';

import { WinstonLogger } from '@Libs/WinstonLogger';

import ColyseusProvider from '@Providers/ColyseusProvider';

const server = http.createServer();
const cache = new Redis.Redis(['redis://localhost:7001']);
Container.set('cache', cache);

const colyseusProvider = new ColyseusProvider(path.resolve('./src'), WinstonLogger.create(this), server, cache);

export const _before = async () => {
  await colyseusProvider.register();
  await colyseusProvider.boot();
};

export const _after = async () => {
  await colyseusProvider.close();
};
