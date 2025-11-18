import apm from 'elastic-apm-node';
import Bull, { Job, JobOptions, Queue } from 'bull';
import Redis from 'ioredis';
import { isString } from 'lodash';
import Container from 'typedi';
import winston from 'winston';

import { env } from '@Libs/env';

export default abstract class Queueable<T> {
  private readonly queueInstance: Queue; //queue instance
  private readonly verbose: boolean;
  protected logger: winston.Logger;

  constructor(logger: winston.Logger, redis: Redis.Redis, verbose = true) {
    this.logger = logger;
    this.verbose = verbose;
    this.queueInstance = new Bull(this.queueName(), {
      prefix: `{${this.queueName()}}`,
      defaultJobOptions: { attempts: 20, backoff: 10000 },
      settings: {
        backoffStrategies: {
          // truncated binary exponential backoff
          arithmeticProgression: function (attemptsMade, err) {
            // Options can be undefined, you need to handle it by yourself
            const delay = 5000;
            return delay * (attemptsMade + 1);
          },
        },
      },
      createClient: () => this.createRedisClient(redis),
    });
  }

  public getInstance() {
    return this.queueInstance;
  }

  public async close() {
    return this.queueInstance.close();
  }

  public registerProcess() {
    this.logger.info(`Register job ${this.queueName()} success`);
    let concurrency = this.getConcurrency();
    if (isString(concurrency)) {
      concurrency = parseInt(concurrency);
    }

    return this.queueInstance.process(concurrency, this.getProcessHandler.bind(this));
  }

  public async dispatch(value: T, options?: JobOptions): Promise<Job> {
    if (this.verbose) {
      this.logger.info(`Dispatch to queue with data`, JSON.stringify({ value, _queueOptions: options }));
    }
    if (!options) {
      options = {};
    }
    if (!options.removeOnComplete) options.removeOnComplete = 100;
    if (!options.removeOnFail) options.removeOnFail = 1000;
    return this.queueInstance.add(value, options);
  }

  /**
   * max parallel task can run at the same time
   */
  public getConcurrency(): number {
    return 1;
  }

  /**
   * middleware before call handle
   */
  public getProcessHandler(job: Job<T>) {
    let traceId: string;
    if (env.apmEnabled) {
      const apm = Container.get<apm.Agent>('apmAgent');
      apm.startTransaction();
      traceId = apm.currentTraceIds['trace.id'];
    }
    if (this.verbose) {
      this.logger.info(`queue resolve start trace.id: ${traceId} with data`, JSON.stringify(job.data));
    }
    return this.processHandler(job);
  }

  /**
   * name for this queue
   * need to be unique
   */
  public abstract queueName(): string;

  public abstract processHandler(job: Job<T>);

  private createRedisClient(redis: Redis.Redis): Redis.Redis {
    const client = new Redis({
      ...redis.options,
      retryStrategy(times: number) {
        return Math.min(times * 50, 2000);
      },
      maxRetriesPerRequest: null,
    });

    client.on('error', err => {
      this.logger.error(`Queue redis client error for ${this.queueName()}`, err);
    });
    client.on('end', () => {
      this.logger.warn(`Queue redis client disconnected for ${this.queueName()}, attempting to reconnect...`);
    });
    client.on('reconnecting', () => {
      this.logger.info(`Queue redis client reconnecting for ${this.queueName()}`);
    });

    return client;
  }
}
