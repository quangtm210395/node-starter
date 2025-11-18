import { Container, Service } from 'typedi';
import { Consumer, Kafka } from 'kafkajs';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { env } from '@Libs/env';
import { KafkaConsumerDefinition, getKafkaConsumers, KafkaMessageConsumer, KafkaParsedMessage } from '@Libs/kafka/KafkaConsumerMetadata';

@Service()
export class KafkaConsumerRunner {
  private readonly consumers: Consumer[] = [];

  constructor(@Logger(module) private readonly logger: winston.Logger) {}

  public async boot(kafka: Kafka): Promise<void> {
    const definitions = this.getEnabledConsumers();
    if (!definitions.length) {
      this.logger.info('No Kafka consumers registered.');
      return;
    }

    for (const definition of definitions) {
      await this.registerConsumer(kafka, definition);
    }
  }

  private getEnabledConsumers(): KafkaConsumerDefinition[] {
    const definitions = getKafkaConsumers();
    const enabled = env.kafka.enabledConsumers.filter(Boolean);
    if (!enabled.length) {
      return definitions;
    }
    return definitions.filter(definition => {
      const name = definition.name || definition.target.name;
      const isEnabled = enabled.includes(name);
      if (!isEnabled) {
        this.logger.info(`Kafka consumer ${name} disabled via KAFKA_ENABLED_CONSUMERS.`);
      }
      return isEnabled;
    });
  }

  private async registerConsumer(kafka: Kafka, definition: KafkaConsumerDefinition): Promise<void> {
    const groupId = definition.groupId || env.kafka.consumer.groupId || `${env.kafka.clientId}-${definition.topic}`;
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({
      topic: definition.topic,
      fromBeginning: definition.fromBeginning ?? env.kafka.consumer.fromBeginning,
    });

    const handler = Container.get<KafkaMessageConsumer>(definition.target);
    consumer
      .run({
        eachMessage: async payload => {
          try {
            const parsed = this.parseMessage(payload);
            await handler.handle(parsed);
          } catch (error) {
            this.logger.error(`Kafka consumer ${definition.target.name} failed on topic ${definition.topic}`, error);
          }
        },
      })
      .catch(err => {
        this.logger.error(`Kafka consumer ${definition.target.name} crashed`, err);
      });

    this.consumers.push(consumer);
    this.logger.info(`Kafka consumer ${definition.target.name} subscribed to ${definition.topic} (${groupId}).`);
  }

  public async shutdown(): Promise<void> {
    await Promise.all(
      this.consumers.map(async consumer => {
        try {
          await consumer.disconnect();
        } catch (error) {
          this.logger.error('Failed to disconnect Kafka consumer', error);
        }
      }),
    );
    this.consumers.length = 0;
  }

  private parseMessage<T>({ topic, partition, message }: Parameters<Consumer['run']>[0]['eachMessage'] extends (arg: infer P) => any ? P : never): KafkaParsedMessage<T> {
    let value: T;
    const rawValue = message.value?.toString() || '';
    try {
      value = rawValue ? (JSON.parse(rawValue) as T) : (undefined as T);
    } catch (error) {
      this.logger.warn(`Failed to parse Kafka message on ${topic}:${partition}, delivering raw string.`);
      value = rawValue as unknown as T;
    }

    return {
      topic,
      partition,
      offset: message.offset,
      headers: message.headers,
      raw: message,
      value,
    };
  }
}
