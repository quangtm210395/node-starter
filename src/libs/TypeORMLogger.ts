import { QueryRunner, AbstractLogger, LogLevel, LogMessage, LoggerOptions } from 'typeorm';
import winston from 'winston';

import { env } from '@Libs/env';
import { WinstonLogger } from '@Libs/WinstonLogger';
import { getLoggingLevel } from '@Libs/helper';

export class TypeORMLogger extends AbstractLogger {
  private logger: winston.Logger;
  constructor(
    options: LoggerOptions,
  ) {
    super(options);
    this.logger = WinstonLogger.create(module);
  }
  protected writeLog(level: LogLevel, logMessage: string | number | LogMessage | (string | number | LogMessage)[],
    queryRunner?: QueryRunner): void {
    const messages = this.prepareLogMessages(logMessage);
    for (const message of messages) {
      switch (message.type ?? level) {
        case 'log':
        case 'schema-build':
        case 'migration':
        case 'info':
        case 'query':
          this.logger.info(`${message.prefix || ''} ${message.message}`);
          break;
        case 'warn':
        case 'query-slow':
          this.logger.warn(`${message.prefix || ''} ${message.message}`);
          break;
        case 'error':
        case 'query-error':
          this.logger.error(`${message.prefix || ''} ${message.message}`);
          break;
      }
    }
  }
}
