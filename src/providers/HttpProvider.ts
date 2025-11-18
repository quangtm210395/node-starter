import path from 'path';
import { createServer, Server } from 'http';

import { useExpressServer, useContainer } from 'routing-controllers';
import winston from 'winston';
import express, { Express } from 'express';
import helmet from 'helmet';
import { Container, Inject, Service } from 'typedi';
import { mongoose } from '@typegoose/typegoose';
import { Alohomora } from '@hikariq/alohomora';

import { Logger } from '@Decorators/Logger';

import ServiceProvider from '@Libs/provider/ServiceProvider';
import { appEvent } from '@Libs/appEvent';
import { env } from '@Libs/env';
import { ServerType } from '@Libs/env/ServerType';
import { swaggerSetup } from '@Libs/swagger';
import { WinstonLogger } from '@Libs/WinstonLogger';

import { RestRoles } from '@Enums/RestRoles';

@Service()
export default class HttpProvider extends ServiceProvider {
  private expressApp: Express;
  private httpServer: Server;
  private keycloak: Alohomora;

  constructor(@Inject('rootPath') private readonly rootPath: string, @Logger(module) private logger: winston.Logger) {
    super();
  }

  async register(): Promise<void> {
    if (!ServerType.allowProducerServer()) {
      this.logger.info('HttpProvider register skipped (producer server type disabled).');
      return;
    }
    this.expressApp = express();
    this.httpServer = createServer(this.expressApp);
    Container.set('express', this.expressApp);
    Container.set('httpServer', this.httpServer);
    this.keycloak = new Alohomora({
      LoggerFactory: WinstonLogger,
    });
    Container.set('keycloak', this.keycloak);
    useContainer(Container);
  }

  async boot(): Promise<void> {
    if (!ServerType.allowProducerServer()) {
      return;
    }
    this.expressApp.get('/', (req, res) => {
      return res.send('Hello there');
    });
    this.expressApp.get('/health', (req, res) => {
      if (Container.has('shutdownInProgress') && Container.get('shutdownInProgress')) {
        return res.status(503).json({ status: 'unhealthy', reason: 'shutdown_in_progress' });
      }
      const memoryLimit = env.health.maxMemoryUsageInBytes;
      if (memoryLimit) {
        const rss = process.memoryUsage().rss;
        if (rss > memoryLimit) {
          return res.status(503).json({ status: 'unhealthy', reason: 'memory_usage_exceeded', rss, limit: memoryLimit });
        }
      }
      return res.json({ status: 'ok' });
    });
    const cspDefaults = helmet.contentSecurityPolicy.getDefaultDirectives();
    delete cspDefaults['upgrade-insecure-requests'];
    this.expressApp.use(helmet({
      contentSecurityPolicy: {
        directives: cspDefaults,
      },
    }));
    this.expressApp.use(env.app.routePrefix || '/api', this.keycloak.init());
    useExpressServer(this.expressApp, {
      cors: true,
      classTransformer: true,
      classToPlainTransformOptions: {
        excludePrefixes: ['_'],
        // excludeExtraneousValues: true,
      },
      validation: {
        skipMissingProperties: false,
        whitelist: true,
      },
      routePrefix: env.app.routePrefix || '/api',
      defaultErrorHandler: false,
      controllers: [path.join(this.rootPath, 'rests/controllers/*Controller.{ts,js}')],
      middlewares: [path.join(this.rootPath, 'middlewares/rest/*')],
      interceptors: [path.join(this.rootPath, 'interceptors/rest/*')],
      authorizationChecker: async (action, roles: RestRoles[]) => {
        if (!(action.request as any).identity) {
          return false;
        }
        if (roles && roles.length) {
          const r: string[] = (action.request as any).roles || [];
          if (!roles.find(role => r.indexOf(role.toString()) !== -1)) {
            return false;
          }
        }
        return true;
      },
    });
    swaggerSetup(this.expressApp);
    if (ServerType.allowProducerServer()) {
      //start server http
      this.httpServer.listen(env.app.port, () => {
        appEvent.emit('server_started', env.app.port);
      });
    }
  }

  async close() {
    if (!ServerType.allowProducerServer() || !this.httpServer) {
      return;
    }
    this.logger.info('Closing http server.');
    return new Promise((resolve, reject) => {
      this.httpServer.close(() => {
        this.logger.info('Http server closed.');
        mongoose.connection.close(false, () => {
          this.logger.info('MongoDb connection closed.');
          resolve(null);
        });
      });
    });
  }
}
