import { Service } from 'typedi';
import winston from 'winston';

import { KafkaListener } from '@Decorators/KafkaListener';
import { Logger } from '@Decorators/Logger';

import { KafkaMessageConsumer, KafkaParsedMessage } from '@Libs/kafka/KafkaConsumerMetadata';

interface DemoPayload {
  message: string;
}

@Service()
@KafkaListener({ topic: 'demo-topic' })
export class ExampleKafkaConsumer implements KafkaMessageConsumer<DemoPayload> {
  constructor(@Logger(module) private readonly logger: winston.Logger) {}

  async handle({ topic, partition, value, headers }: KafkaParsedMessage<DemoPayload>): Promise<void> {
    this.logger.info('ExampleKafkaConsumer received message', {
      topic,
      partition,
      value,
      headers,
    });
  }
}
