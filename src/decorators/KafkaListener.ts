import { registerKafkaConsumer, KafkaConsumerConstructor, KafkaConsumerOptions } from '@Libs/kafka/KafkaConsumerMetadata';

export function KafkaListener(options: KafkaConsumerOptions): ClassDecorator {
  if (!options?.topic) {
    throw new Error('KafkaListener requires a topic.');
  }

  return target => {
    registerKafkaConsumer({
      target: target as unknown as KafkaConsumerConstructor,
      name: options.name || (target as Function).name,
      ...options,
    });
  };
}
