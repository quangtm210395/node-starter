import 'reflect-metadata';
import { expect } from 'chai';

import { KafkaListener } from '@Decorators/KafkaListener';

import { clearKafkaConsumers, getKafkaConsumers } from '@Libs/kafka/KafkaConsumerMetadata';

describe('KafkaListener metadata registration', () => {
  beforeEach(() => {
    clearKafkaConsumers();
  });

  it('registers consumer definitions with provided options', () => {
    @KafkaListener({ topic: 'demo-topic', groupId: 'demo-group', fromBeginning: true })
    class DemoConsumer {}

    const definitions = getKafkaConsumers();
    expect(definitions).to.have.length(1);
    expect(definitions[0]).to.include({ topic: 'demo-topic', groupId: 'demo-group', fromBeginning: true });
    expect(definitions[0].target).to.equal(DemoConsumer);
  });
});
