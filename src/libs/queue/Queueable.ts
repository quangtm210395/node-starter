import Bull, { Job, JobOptions, Queue } from 'bull';
import  Redis  from 'ioredis';
import { isString } from 'lodash';
import winston from 'winston';

export default abstract class Queueable<T> {
  private readonly queueInstance: Queue; //queue instance
  protected logger: winston.Logger;

  constructor(logger: winston.Logger, redis: Redis.Redis) {
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
      createClient: (type, opts) => {
        return redis.duplicate();
      },
    });
    this.logger = logger;
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
    this.logger.info(`Dispatch to queue with data`, JSON.stringify({ value, _queueOptions: options }));
    if (options) {
      if (!options.removeOnComplete) options.removeOnComplete = 100;
      if (!options.removeOnFail) options.removeOnFail = 100;
    }
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
    this.logger.info(`queue resolve start with data`, JSON.stringify(job.data));
    return this.processHandler(job);
  }

  /**
   * name for this queue
   * need to be unique
   */
  public abstract queueName(): string;

  public abstract processHandler(job: Job<T>);
}
