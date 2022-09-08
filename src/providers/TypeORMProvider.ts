import path from 'path';

import winston from 'winston';
import { Container, Inject, Service } from 'typedi';
import { DataSource, DataSourceOptions } from 'typeorm';

import { Logger } from '@Decorators/Logger';

import ServiceProvider from '@Libs/provider/ServiceProvider';
import { env } from '@Libs/env';
import { appEvent } from '@Libs/appEvent';

@Service()
export default class TypeORMProvider extends ServiceProvider {
  private dataSource: DataSource;

  constructor(@Logger(module) private logger: winston.Logger, @Inject('rootPath') private readonly rootPath: string) {
    super();
  }

  async register(): Promise<void> {
    const options: DataSourceOptions = {
      type: env.db.type as any,
      host: env.db.host,
      port: env.db.port,
      username: env.db.username,
      password: env.db.password,
      database: env.db.database,
      synchronize: env.db.synchronize,
      logging: env.db.logging as any,
      logger: env.db.logger as any,
      migrations: env.db.migrations,
      entities: [path.join(this.rootPath, `databases/${env.db.type}/entities/{*.ts,*.js}`)],
      reconnectInterval: 5000,
      cache: true,
      // schema: env.db.schema,
    };
    this.dataSource = new DataSource(options);

    Container.set('dataSource', this.dataSource);
  }

  async boot(): Promise<void> {
    await this.dataSource.initialize();
    appEvent.emit('db_connected', env.db.type);
    appEvent.on('shutdown', () => {
      this.dataSource.destroy();
    });
  }
}
