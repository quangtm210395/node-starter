import { Container, Service } from 'typedi';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { appEvent } from '@Libs/appEvent';
import { env } from '@Libs/env';
import { ServerType } from '@Libs/env/ServerType';
import ServiceProvider from '@Libs/provider/ServiceProvider';
import Queueable from '@Libs/queue/Queueable';
import { getQueueWorkers, QueueableConstructor } from '@Libs/queue/QueueMetadata';
import { loadModulesFromPatterns } from '@Libs/utils/moduleLoader';

@Service()
export default class JobsProvider extends ServiceProvider {
  private readonly runningJobs: Queueable<any>[] = [];

  constructor(@Logger(module) private readonly logger: winston.Logger) {
    super();
  }

  async register(): Promise<void> {
    if (!ServerType.allowWorkerServer()) {
      return;
    }

    await loadModulesFromPatterns(env.jobHandlers, 'job definition');
  }

  async boot(): Promise<void> {
    if (!ServerType.allowWorkerServer()) {
      return;
    }

    const jobClasses = getQueueWorkers();
    if (!jobClasses.length) {
      this.logger.info('No Bull queue workers registered.');
      return;
    }

    const enabledQueues = env.jobDefinitions.filter(Boolean);
    const runAll = enabledQueues.length === 0;

    for (const JobClass of jobClasses) {
      await this.startJob(JobClass, runAll, enabledQueues);
    }
  }

  async close(): Promise<void> {
    if (!ServerType.allowWorkerServer()) {
      return;
    }

    this.logger.info('Closing Bull queues');
    while (this.runningJobs.length) {
      const job = this.runningJobs.pop();
      try {
        await job.close();
      } catch (error) {
        this.logger.error(`Failed to close queue ${job.queueName()}`, error);
      }
    }
    appEvent.emit('queue_stopped');
  }

  private async startJob(JobClass: QueueableConstructor, runAll: boolean, enabledQueues: string[]): Promise<void> {
    const instance = Container.get(JobClass);
    const jobName = instance.queueName();
    if (!runAll && !enabledQueues.includes(jobName)) {
      this.logger.info(`Skipping WorkerJob ${jobName} (disabled via JOB_DEFINITIONS)`);
      return;
    }

    instance.registerProcess();
    this.runningJobs.push(instance);
    this.logger.info(`WorkerJob ${jobName} registered.`);
  }
}
