import 'reflect-metadata';
import { Container, Service } from 'typedi';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { appEvent } from '@Libs/appEvent';
import { Kernel } from '@Libs/Kernel';

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

      const handleClose = async (signal: string) => {
        this.logger.info(`${signal} signal received.`);
        //close all all provider
        const closingProviders = [...providers];
        for (let provider of closingProviders.reverse()) {
          await Container.get(provider).close();
        }
        appEvent.emit('process_closed');
      };
      process.on('SIGTERM', handleClose);
      process.on('SIGINT', handleClose);
      appEvent.on('process_closed', () => {
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
