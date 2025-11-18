import 'reflect-metadata';
import { expect } from 'chai';

import { QueueWorker } from '@Decorators/QueueWorker';

import { clearQueueWorkers, getQueueWorkers } from '@Libs/queue/QueueMetadata';

describe('QueueWorker metadata registration', () => {
  beforeEach(() => {
    clearQueueWorkers();
  });

  it('registers decorated queue classes', () => {
    @QueueWorker()
    class DemoQueue {}

    const queues = getQueueWorkers();
    expect(queues).to.have.length(1);
    expect(queues[0]).to.equal(DemoQueue);
  });
});
