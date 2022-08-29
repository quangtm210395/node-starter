import winston from 'winston';
import { Container, Service } from 'typedi';
import mongoose, { Connection, ConnectOptions } from 'mongoose';

import { Logger } from '@Decorators/Logger';

import ServiceProvider from '@Libs/provider/ServiceProvider';
import { wait } from '@Libs/helper';
import { env } from '@Libs/env';

@Service()
export default class MongodbProvider extends ServiceProvider {
  private db: Connection;
  private isClosed = false;

  constructor(@Logger(module) private logger: winston.Logger) {
    super();
  }

  async register(): Promise<void> {
    this.db = mongoose.connection;
    Container.set('mongoConnection', this.db);
  }

  async boot(): Promise<void> {
    let uri = env.mongodb.uri;
    this.db.on('connecting', () => {
      this.logger.info('connecting to MongoDB...');
    });

    this.db.on('error', (error: any) => {
      this.logger.error(`Error in MongoDb connection: ${error}`);
      mongoose.disconnect();
    });

    this.db.on('connected', () => {
      this.logger.info('MongoDB connected!');
    });

    this.db.once('open', () => {
      this.logger.info('MongoDB connection opened!');
    });

    this.db.on('reconnected', () => {
      this.logger.info('MongoDB reconnected!');
    });

    this.db.once('close', () => {
      this.logger.info('MongoDB closed!');
      this.isClosed = true;
    });

    this.db.on('disconnected', async () => {
      this.logger.info('MongoDB disconnected!');
      await wait(2000);
      if (!this.isClosed) {
        await MongodbProvider.tryConnect(uri);
      }
    });

    return MongodbProvider.tryConnect(uri);
  }

  private static async tryConnect(uri: string) {
    await mongoose.connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    } as ConnectOptions);
  }
}
