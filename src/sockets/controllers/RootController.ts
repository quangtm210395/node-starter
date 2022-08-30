import { SocketController, OnConnect, OnDisconnect, OnMessage, MessageBody, EmitOnSuccess, ConnectedSocket, SocketId } from 'socket-controllers';
import winston from 'winston';
import { Socket } from 'socket.io';
import { Service } from 'typedi';

import { Logger } from '@Decorators/Logger';

import { TextMessage } from '@Sockets/messages/TextMessage';

@Service()
@SocketController('/socket')
export class RootSocketController {
  constructor(@Logger(module) private readonly logger: winston.Logger) {}

  @OnConnect()
  connect(@ConnectedSocket() socket: Socket, @SocketId() socketId: string) {
    this.logger.info(`client connected!: ${socketId} `, socket.connected);
  }

  @OnDisconnect()
  disconnect(@SocketId() socketId: string) {
    this.logger.info('client disconnected!: ', socketId);
  }

  @OnMessage('save')
  @EmitOnSuccess('message_saved', {})
  save(@MessageBody() message: TextMessage) {
    this.logger.info('save:: received message: ', message);
    return message;
  }
}
