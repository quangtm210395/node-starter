import 'reflect-metadata';
import { Container, Service } from 'typedi';
import winston from 'winston';

// eslint-disable-next-line , import/order
const agent = require('elastic-apm-node').start({
  active: !!process.env.ELASTIC_APM_SERVICE_NAME,
});
Container.set('apmAgent', agent);

import { Logger } from '@Decorators/Logger';

import { appEvent } from '@Libs/appEvent';
import { Kernel } from '@Libs/Kernel';
import { env } from '@Libs/env';

@Service()
class MainApplication {
  constructor(@Logger(module) private readonly logger: winston.Logger) {}

  public async bootstrap() {
    Container.set('rootPath', __dirname);
    try {
      let providers = Kernel.providers;
      //register all all provider
      for (let provider of providers) {
        await Container.get(provider).register();
      }

      //boot all all provider
      for (let provider of providers) {
        await Container.get(provider).boot();
      }

      process.on('uncaughtException', err => {
        this.logger.error('Uncaught Exception thrown', err);
        // appEvent.emit('shutdown');
        // process.exit(1);
      });

      let shuttingDown = false;
      const handleClose = async (signal: NodeJS.Signals) => {
        if (shuttingDown) {
          this.logger.warn(`Shutdown already in progress. Ignoring ${signal}.`);
          return;
        }
        shuttingDown = true;
        Container.set('shutdownInProgress', true);
        this.logger.info(`${signal} signal received. Starting graceful shutdown.`);

        const forceExitTimeout = env.shutdown.gracePeriodInMs;
        const forceExitTimer = setTimeout(() => {
          this.logger.error(`Graceful shutdown timed out after ${forceExitTimeout}ms. Forcing exit.`);
          process.exit(1);
        }, forceExitTimeout).unref();

        const closingProviders = [...providers];
        for (let provider of closingProviders.reverse()) {
          try {
            await Container.get(provider).close();
          } catch (error) {
            this.logger.error(`Failed to close provider ${provider.name}`, error);
          }
        }

        clearTimeout(forceExitTimer);
        // appEvent.emit('process_closed');
      };
      process.once('SIGTERM', handleClose);
      process.once('SIGINT', handleClose);
      process.once('SIGQUIT', handleClose);
      appEvent.once('process_closed', () => {
        this.logger.info('Successfully closed process.');
        process.exit(0);
      });
    } catch (err) {
      this.logger.error('Error occurs during bootstrap: ', err);
      appEvent.emit('shutdown');
      process.exit(1);
    }
  }
}

Container.get(MainApplication).bootstrap();
