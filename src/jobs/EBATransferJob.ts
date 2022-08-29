import Bull from 'bull';
import { Inject, Service } from 'typedi';
import winston from 'winston';
import  Redis  from 'ioredis';
import { AxiosError } from 'axios';

import { Logger } from '@Decorators/Logger';

import Queueable from '@Libs/queue/Queueable';
import { env } from '@Libs/env';
import { internal } from '@Libs/axios';

@Service()
export class EBATransferJob extends Queueable<any> {
  constructor(@Logger(module) logger: winston.Logger, @Inject('cache') cache: Redis.Redis) {
    super(logger, cache);
  }

  async processHandler(job: Bull.Job<any>) {
    let url = `${env.app.schema}://${env.app.host}:${env.app.externalPort}${env.app.beRoutePrefix}/eba/transfer-event`;
    await internal.post(url, job.data)
      .then((res) => {
        this.logger.info(`processHandler:: call api ${url} handle event: `, res.status, res.data);
      })
      .catch((err: AxiosError) => {
        this.logger.error(`processHandler:: call api ${url} handle error status: ${err?.response?.status} `, err);
        throw err;
      });
  }

  queueName(): string {
    return 'EBATransferJob';
  }
}
