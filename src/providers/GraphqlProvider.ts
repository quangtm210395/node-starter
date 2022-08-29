/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
import { Server as HttpServer } from 'http';

import { ObjectId, Decimal128 } from 'mongodb';
import { Express, urlencoded } from 'express';
import { Container, Inject, Service } from 'typedi';
import { buildSchema, UnauthorizedError } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import winston from 'winston';
import Redis from 'ioredis';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { json } from 'body-parser';

import { Logger } from '@Decorators/Logger';

import ServiceProvider from '@Libs/provider/ServiceProvider';
import { ObjectIdScalar } from '@Libs/ObjectIdScalar';
import { env } from '@Libs/env';
import { appEvent } from '@Libs/appEvent';
import { Decimal128Scalar } from '@Libs/Decimal128Scalar';
import { DateTimeScalar } from '@Libs/DateTimeScalar';

import { UserRoles } from '@Enums/UserRoles';

import { LogAccess } from '@Middlewares/graphql/LogAccessMiddleware';
import { authenticate } from '@Middlewares/graphql/authenticationMiddleware';
import { TypegooseMiddleware } from '@Middlewares/graphql/TypegooseMiddleware';
import { ErrorHandlerMiddleware } from '@Middlewares/graphql/ErrorHandlerMiddleware';

const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js');

@Service()
export default class GraphqlProvider extends ServiceProvider {
  private server: ApolloServer;

  constructor(
    @Inject('express') private readonly expressApplication: Express,
    @Inject('rootPath') private readonly rootPath: string,
    @Logger(module) private logger: winston.Logger,
    @Inject('cache') private readonly cache: Redis.Redis,
    @Inject('httpServer') private readonly httpServer: HttpServer,
  ) {
    super();
  }

  async register(): Promise<void> {
    //graphql pubsub instance
    const pubSub = new RedisPubSub({
      publisher: this.cache,
      subscriber: this.cache,
    });

    //schema build
    const schema = await buildSchema({
      resolvers: [path.join(this.rootPath, 'resolvers/{*Resolver.ts,*Resolver.js}')],
      emitSchemaFile: path.resolve(this.rootPath, 'schema.gql'),
      // use document converting middleware
      globalMiddlewares: [LogAccess, TypegooseMiddleware, ErrorHandlerMiddleware],
      // use ObjectId scalar mapping
      scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar },
        { type: Decimal128, scalar: Decimal128Scalar },
        { type: Date, scalar: DateTimeScalar }],
      validate: {
        skipMissingProperties: false,
        // forbidUnknownValues: true,
        whitelist: true,
      },
      container: Container,
      pubSub,
      authChecker: ({ root, args, context, info }, roles: UserRoles[]) => {
        const { req } = context;
        if (req.isIntrospection) {
          return true;
        }
        // custom logic here, e.g.:
        const credentials = context.credentials;
        if (!credentials) {
          return false;
        }
        if (roles && roles.length) {
          const r: string[] = credentials.payload['roles'] || [];
          if (!roles.find(role => r.indexOf(role.toString()) !== -1)) {
            throw new UnauthorizedError();
          }
        }
        return true;
      },
    });

    //apollo server instance
    this.server = new ApolloServer({
      schema,
      introspection: !env.isProduction,
      context: async ({ req, res }) => ({ req, res, credentials: (req as any).credentials }),
    });

    //subscription server instance
    SubscriptionServer.create(
      {
        schema,
        execute,
        subscribe,
      },
      {
        server: this.httpServer,
        path: env.graphql.subscriptionPath,
      },
    );

    Container.set('apolloServer', this.server);
    Container.set('pubSub', pubSub);
  }

  async boot(): Promise<void> {
    await this.server.start();
    this.expressApplication.use(env.graphql.path, json());
    this.expressApplication.use(env.graphql.path, urlencoded({ extended: true }));
    this.expressApplication.use(env.graphql.path,
      graphqlUploadExpress({ maxFileSize: env.imageUploader.maxSize, maxFiles: 1 }));
    this.expressApplication.use(env.graphql.path, authenticate(this.cache));
    this.server.applyMiddleware({ app: this.expressApplication, path: env.graphql.path });
    appEvent.emit('graphql_started', env.graphql.path);
  }
}
