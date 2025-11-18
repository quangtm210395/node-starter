import { Container, Service } from 'typedi';
import { Kafka, Producer } from 'kafkajs';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { env } from '@Libs/env';
import { ServerType } from '@Libs/env/ServerType';
import { KafkaConsumerRunner } from '@Libs/kafka/KafkaConsumerRunner';
import { createKafkaLogCreator } from '@Libs/kafka/KafkaLogger';
import ServiceProvider from '@Libs/provider/ServiceProvider';
import { loadModulesFromPatterns } from '@Libs/utils/moduleLoader';
import { WinstonLogger } from '@Libs/WinstonLogger';

@Service()
export default class KafkaProvider extends ServiceProvider {
  private kafka?: Kafka;
  private producer?: Producer;

  constructor(@Logger(module) private readonly logger: winston.Logger) {
    super();
  }

  async register(): Promise<void> {
    if (!env.kafka.enabled || !ServerType.allowConsumerServer()) {
      this.logger.info('KafkaProvider disabled by configuration.');
      return;
    }

    if (!env.kafka.brokers.length) {
      this.logger.warn('KafkaProvider enabled but no brokers configured.');
      return;
    }

    this.kafka = new Kafka({
      clientId: env.kafka.clientId,
      brokers: env.kafka.brokers,
      logCreator: createKafkaLogCreator(WinstonLogger.create(module, 'kafkajs')),
      ssl: env.kafka.sslEnabled ? { rejectUnauthorized: false } : undefined,
      sasl:
        env.kafka.saslEnabled && env.kafka.username && env.kafka.password
          ? {
            mechanism: env.kafka.saslMechanism as any,
            username: env.kafka.username,
            password: env.kafka.password,
          }
          : undefined,
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: env.kafka.allowAutoTopicCreation,
    });

    Container.set('kafka', this.kafka);
    Container.set('kafkaProducer', this.producer);

    await loadModulesFromPatterns(env.kafka.consumers, 'Kafka consumer');
  }

  async boot(): Promise<void> {
    if (!this.kafka || !this.producer) {
      return;
    }

    await this.producer.connect();
    this.logger.info('Kafka producer connected.');

    const consumerRunner = Container.get(KafkaConsumerRunner);
    await consumerRunner.boot(this.kafka);
  }

  async close(): Promise<void> {
    if (!this.kafka) {
      return;
    }
    this.logger.info('Closing Kafka connection!');

    try {
      const consumerRunner = Container.get(KafkaConsumerRunner);
      await consumerRunner.shutdown();
    } catch (error) {
      this.logger.error('Failed to shutdown Kafka consumers', error);
    }

    if (this.producer) {
      await this.producer.disconnect();
      this.logger.info('Kafka producer disconnected.');
    }
  }
}
