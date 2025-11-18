import { Inject, Service } from 'typedi';
import winston from 'winston';
import { Job } from 'bull';
import Redis from 'ioredis';

import { Logger } from '@Decorators/Logger';
import { QueueWorker } from '@Decorators/QueueWorker';

import Queueable from '@Libs/queue/Queueable';

interface ExampleQueueWorkerPayload {
  message: string;
}

@Service()
@QueueWorker()
export class ExampleQueueWorkerJob extends Queueable<ExampleQueueWorkerPayload> {
  constructor(@Logger(module) logger: winston.Logger, @Inject('cache') cache: Redis.Redis) {
    super(logger, cache);
  }

  public queueName(): string {
    return 'ExampleQueueWorkerJob';
  }

  public async processHandler(job: Job<ExampleQueueWorkerPayload>): Promise<void> {
    this.logger.info('Processing example worker job', job.data);
  }
}
