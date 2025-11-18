import Queueable from '@Libs/queue/Queueable';

export type QueueableConstructor<T extends Queueable<unknown> = Queueable<any>> = new (...args: any[]) => T;

const queueWorkerDefinitions = new Set<QueueableConstructor>();

export function registerQueueWorker(target: QueueableConstructor): void {
  queueWorkerDefinitions.add(target);
}

export function getQueueWorkers(): QueueableConstructor[] {
  return Array.from(queueWorkerDefinitions);
}

export function clearQueueWorkers(): void {
  queueWorkerDefinitions.clear();
}
