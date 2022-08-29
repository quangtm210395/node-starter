import { Server as HttpServer } from 'http';
import path from 'path';

import { Container, Inject, Service } from 'typedi';
import { Server } from 'socket.io';
import  Redis  from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { useContainer, useSocketServer } from 'socket-controllers';

import { appEvent } from '@Libs/appEvent';
import ServiceProvider from '@Libs/provider/ServiceProvider';

@Service()
export default class SocketProvider extends ServiceProvider {
  private socketIO: Server;
  constructor(
    @Inject('httpServer') private readonly httpServer: HttpServer,
    @Inject('cache') private readonly cache: Redis.Redis,
    @Inject('rootPath') private readonly rootPath: string,
  ) {
    super();
  }

  async register(): Promise<void> {
    this.socketIO = new Server(this.httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    useContainer(Container);

    Container.set('socket', this.socketIO);
  }

  async boot(): Promise<void> {
    const subClient = this.cache.duplicate();

    this.socketIO.adapter(createAdapter(this.cache, subClient));

    useSocketServer(this.socketIO, {
      controllers: [path.join(this.rootPath, 'sockets/controllers/*Controller.{ts,js}')],
      middlewares: [path.join(this.rootPath, 'middlewares/socket/*Middleware.{ts,js}')],
    });
    appEvent.emit('socket_started');
  }
}
