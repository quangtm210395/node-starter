import { logCreator, logLevel } from 'kafkajs';
import winston from 'winston';

export function createKafkaLogCreator(logger: winston.Logger): logCreator {
  return () => ({ namespace, label, log, level }) => {
    const { message, ...extra } = log;
    const meta = { namespace, label, ...extra };

    switch (level) {
      case logLevel.ERROR:
        logger.error(message, meta);
        break;
      case logLevel.WARN:
        logger.warn(message, meta);
        break;
      case logLevel.INFO:
        logger.info(message, meta);
        break;
      case logLevel.DEBUG:
        logger.debug(message, meta);
        break;
      default:
        logger.info(message, meta);
    }
  };
}
