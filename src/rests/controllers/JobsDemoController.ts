import { Body, JsonController, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { IsString } from 'class-validator';
import winston from 'winston';
import { Service } from 'typedi';

import { Logger } from '@Decorators/Logger';

import { ExampleQueueWorkerJob } from '@Jobs/ExampleBullJob';

class DispatchJobBody {
  @IsString()
  message: string;
}

@Service()
@JsonController('/jobs-demo')
@OpenAPI({ security: [{ BearerToken: [] }] })
export class JobsDemoController {
  constructor(
    @Logger(module) private readonly logger: winston.Logger,
    private readonly exampleJob: ExampleQueueWorkerJob,
  ) {}

  @Post('/dispatch')
  public async dispatch(@Body() body: DispatchJobBody) {
    const payload = {
      message: body.message,
      dispatchedAt: new Date().toISOString(),
    };

    this.logger.info('Dispatching ExampleBullJob', payload);
    await this.exampleJob.dispatch(payload);

    return { status: 'queued', queue: this.exampleJob.queueName() };
  }
}
