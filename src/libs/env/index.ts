import * as path from 'path';

import * as dotenv from 'dotenv';

import { getOsEnv, getOsPaths, normalizePort, toBool, toNumber, toArray, toOptionalNumber, getOsEnvOptional } from '@Libs/env/utils';

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config({
  path: path.join(process.cwd(), `.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`),
});

/**
 * Environment variables
 */
export const env = {
  node: process.env.NODE_ENV || 'local',
  isProduction: process.env.NODE_ENV === 'prod',
  isStg: process.env.NODE_ENV === 'stg',
  isDev: process.env.NODE_ENV === 'dev',
  isLocal: process.env.NODE_ENV === 'local' || !process.env.NODE_ENV,
  serverType: process.env.SERVER_TYPE || 'producer', //server type include "producer, worker"
  jobDefinitions: toArray(getOsEnv('JOB_DEFINITIONS')),
  serviceName: getOsEnvOptional('SERVICE_NAME') || 'starter',
  promise: {
    concurrency: toNumber(getOsEnv('PROMISE_CONCURRENCY')),
    retryTime: toNumber(getOsEnv('PROMISE_RETRY_TIME')) || 3,
  },
  app: {
    name: getOsEnv('APP_NAME'),
    host: getOsEnv('APP_HOST'),
    externalPort: getOsEnv('APP_EXTERNAL_PORT'),
    schema: getOsEnv('APP_SCHEMA'),
    routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
    externalRoutePrefix: getOsEnv('APP_EXTERNAL_ROUTE_PREFIX'),
    beRoutePrefix: getOsEnv('APP_BE_ROUTE_PREFIX'),
    port: normalizePort(getOsEnv('APP_PORT')),
  },
  log: {
    level: getOsEnv('LOG_LEVEL'),
    json: toBool(getOsEnvOptional('LOG_JSON')),
  },
  mongodb: {
    uri: getOsEnv('MONGODB_URI'),
  },
  db: {
    type: getOsEnv('DB_TYPE'),
    host: getOsEnv('DB_HOST'),
    port: toNumber(getOsEnv('DB_PORT')),
    username: getOsEnv('DB_USERNAME'),
    password: getOsEnv('DB_PASSWORD'),
    database: getOsEnv('DB_DATABASE'),
    schema: getOsEnv('DB_SCHEMA'),
    synchronize: toBool(getOsEnv('DB_SYNCHRONIZE')),
    logging: getOsEnv('DB_LOGGING'),
    logger: getOsEnv('DB_LOGGER'),
    migrations: getOsPaths('DB_MIGRATIONS'),
  },
  swagger: {
    enabled: toBool(getOsEnv('SWAGGER_ENABLED')),
    route: getOsEnv('SWAGGER_ROUTE'),
    apiDocs: getOsEnv('SWAGGER_API_DOCS'),
  },
  monitor: {
    enabled: toBool(getOsEnv('MONITOR_ENABLED')),
    route: getOsEnv('MONITOR_ROUTE'),
    username: getOsEnv('MONITOR_USERNAME'),
    password: getOsEnv('MONITOR_PASSWORD'),
  },
  graphql: {
    editor: toBool(getOsEnv('GRAPHQL_EDITOR')),
    path: getOsEnv('GRAPHQL_PATH'),
    subscriptionPath: getOsEnv('GRAPHQL_SUBSCRIPTION_PATH'),
  },
  redis: {
    nodes: getOsEnv('REDIS_NODES') || '',
    defaultExpirationTimeInSeconds: toNumber(getOsEnv('REDIS_DEFAULT_EXPIRATION_TIME_IN_SECONDS')) || 24 * 60 * 60, //1 days
  },
  jwt: {
    publicKey: getOsEnvOptional('JWT_PUBLIC_KEY'),
    privateKey: getOsEnvOptional('JWT_PRIVATE_KEY'),
  },
  graphqlJwt: {
    publicKey: getOsEnvOptional('GRAPHQL_JWT_PUBLIC_KEY'),
    privateKey: getOsEnvOptional('GRAPHQL_JWT_PRIVATE_KEY'),
  },
  aws: {
    region: getOsEnvOptional('AWS_REGION') || 'ap-southeast-1',
  },
  imageUploader: {
    maxSize: toNumber(getOsEnv('IMAGE_UPLOADER_MAX_SIZE_IN_BYTES')),
  },
  dataloaderCache: {
    ttlInMilliseconds: toNumber(getOsEnvOptional('DATALOADER_CACHE_TIME_TO_LIVE_IN_MILLISECONDS')) || 300000,
    max: toNumber(getOsEnvOptional('DATALOADER_CACHE_MAX_ITEMS')) || 100,
  },
  keycloak: {
    clientId: getOsEnv('KEYCLOAK_CLIENT_ID'),
    clientSecret: getOsEnv('KEYCLOAK_CLIENT_SECRET'),
    tokenUri: `${getOsEnv('KEYCLOAK_SERVER_URL')}/realms/${getOsEnv('KEYCLOAK_REALM')}/protocol/openid-connect/token`,
  },
};
