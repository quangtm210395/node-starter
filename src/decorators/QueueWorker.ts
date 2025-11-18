import { registerQueueWorker, QueueableConstructor } from '@Libs/queue/QueueMetadata';

export function QueueWorker(): ClassDecorator {
  return target => {
    registerQueueWorker(target as unknown as QueueableConstructor);
  };
}
