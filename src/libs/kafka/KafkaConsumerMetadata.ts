import { KafkaMessage } from 'kafkajs';

export interface KafkaMessageConsumer<T = any> {
  handle(message: KafkaParsedMessage<T>): Promise<void> | void;
}

export interface KafkaParsedMessage<T> {
  value: T;
  raw: KafkaMessage;
  headers?: KafkaMessage['headers'];
  partition: number;
  topic: string;
  offset: string;
}

export type KafkaConsumerConstructor<T extends KafkaMessageConsumer = KafkaMessageConsumer> = new (...args: any[]) => T;

export interface KafkaConsumerOptions {
  topic: string;
  groupId?: string;
  fromBeginning?: boolean;
  name?: string;
}

export interface KafkaConsumerDefinition extends KafkaConsumerOptions {
  target: KafkaConsumerConstructor;
}

const kafkaConsumerDefinitions: KafkaConsumerDefinition[] = [];

export function registerKafkaConsumer(definition: KafkaConsumerDefinition): void {
  kafkaConsumerDefinitions.push(definition);
}

export function getKafkaConsumers(): KafkaConsumerDefinition[] {
  return [...kafkaConsumerDefinitions];
}

export function clearKafkaConsumers(): void {
  kafkaConsumerDefinitions.length = 0;
}
