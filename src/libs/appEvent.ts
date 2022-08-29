import EventEmitter from 'events';

import { WinstonLogger } from '@Libs/WinstonLogger';

export const appEvent = new EventEmitter();
const logger = WinstonLogger.create(module);

appEvent.on('server_started', (port: number) => {
  logger.info(`Server started at port: ${port}`);
});
appEvent.on('graphql_started', (url: string) => {
  logger.info(`GraphQL Playground available at ${url}`);
});
appEvent.on('gameServer_registered', () => {
  logger.info(`Colyseus Server registered !!!`);
});
appEvent.on('socket_started', () => {
  logger.info(`Socket.io started !!!`);
});
appEvent.on('db_connected', (type: string) => {
  logger.info(`${type} db connected!`);
});

appEvent.on('server_stopped', () => {
  logger.info(`Http server stopped`);
});
appEvent.on('cron_stopped', () => {
  logger.info(`Cron jobs stopped`);
});
appEvent.on('queue_stopped', () => {
  logger.info(`Queue jobs stopped`);
});
appEvent.on('gameServer_stopping', () => {
  logger.info(`Colyseus Server is being shutting down !!!`);
});
