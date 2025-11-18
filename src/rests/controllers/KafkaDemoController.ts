import { Body, JsonController, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { IsString } from 'class-validator';
import { Inject, Service } from 'typedi';
import { Producer } from 'kafkajs';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

class ProduceDemoMessageBody {
  @IsString()
  message: string;
}

@Service()
@JsonController('/kafka-demo')
@OpenAPI({ security: [{ BearerToken: [] }] })
export class KafkaDemoController {
  private readonly topic = 'demo-topic';

  constructor(
    @Logger(module) private readonly logger: winston.Logger,
    @Inject('kafkaProducer') private readonly producer: Producer,
  ) {}

  @Post('/produce')
  public async produce(@Body() body: ProduceDemoMessageBody) {
    const payload = {
      message: body.message,
      producedAt: new Date().toISOString(),
    };

    this.logger.info('Producing Kafka demo message', payload);
    await this.producer.send({
      topic: this.topic,
      messages: [{ value: JSON.stringify(payload) }],
    });

    return { status: 'queued', topic: this.topic };
  }
}
