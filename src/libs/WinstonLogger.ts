import path from 'path';

import winston, { format, transports } from 'winston';
import { LEVEL, MESSAGE, SPLAT } from 'triple-beam';
import { isObject, trimEnd } from 'lodash';
import stringify from 'json-stringify-safe';
import safegify from 'safe-stable-stringify';
import ecsFormat from '@elastic/ecs-winston-format';

import { env } from '@Libs/env';

import { LogLevel } from '@Enums/LogLevel';

const { combine, timestamp, printf, align, errors, colorize } = format;

function formatObject(param: any): string {
  if (param && param.stack) {
    if (param.ctx && param.type) {
      return stringify(
        {
          code: param.code,
          type: param.type,
          data: param.data,
        },
        null,
        2,
      );
    }
    return stringify(param);
  }
  if (isObject(param)) {
    return stringify(param);
  }
  return param;
}

/*
 * function replacer (key, value)
 * Handles proper stringification of Buffer and bigint output.
 */
function replacer(key, value) {
  // safe-stable-stringify does support BigInt, however, it doesn't wrap the value in quotes.
  // Leading to a loss in fidelity if the resulting string is parsed.
  // It would also be a breaking change for logform.
  if (typeof value === 'bigint')
    return value.toString();
  return value;
}

const all = format((info: any) => {
  const splat = info[SPLAT] || [];
  const isSplatTypeMessage =
    typeof info.message === 'string' &&
    (info.message.includes('%s') || info.message.includes('%d') || info.message.includes('%j'));
  if (isSplatTypeMessage) {
    return info;
  }
  let message = formatObject(info.message);
  const rest = splat.map(formatObject).join(' ');
  message = trimEnd(`${message} ${rest}`);
  return {
    message,
    level: info.level,
    err: info.err,
    error: info.stack
      ? { type: info.name, message: info.message, stack_trace: info.stack }
      : undefined,
    serviceName: info.serviceName,
    [LEVEL]: info[LEVEL],
    customData: info.customData,
  };
});

const serviceName = format((info: any) => {
  return { ...info, serviceName: env.serviceName };
});

const json = format((info: any, opts: any) => {
  const jsonStringify = safegify.configure(opts);
  info[MESSAGE] = jsonStringify({
    level: info.level,
    message: info.message,
    serviceName: info.serviceName,
    timestamp: info.timestamp,
    fileName: info.fileName,
    stack: info.stack,
  }, opts.replacer || replacer, opts.space);
  return info;
});

const file = (thisModule?: NodeModule) =>
  format((info: any) => {
    if (!thisModule) {
      return info;
    }
    const BASE_PATH = path.resolve('.');
    const fileNameFull = thisModule.filename;
    const fileName = fileNameFull.split(BASE_PATH)[1];
    return { ...info, fileName };
  });

// replace authorization token in the header with '*'
const ignoreAuthorization = format(error => {
  if (error.config?.headers?.Authorization) {
    // eslint-disable-next-line no-param-reassign
    error.config.headers.Authorization = error.config.headers.Authorization.replace(/./gi, '*');
  }
  return error;
});

const upperCase = info => ({ ...info, level: info.level.toUpperCase() });

const nonLocalEnvs = ['dev', 'stg', 'prod'];

export class WLogger {
  transport: any;
  constructor() {
    this.transport = new transports.Console({ level: env.log.level });
  }

  changeLogLevel(level: LogLevel) {
    this.transport.level = level;
  }

  public create(thisModule: NodeModule) {
    const logger = winston.createLogger({
      format: env.log.json ?
        combine(
          serviceName(),
          errors({ stack: true }),
          all(),
          file(thisModule)(),
          ecsFormat(),
        ) :
        combine(
          ignoreAuthorization(),
          errors({ stack: true }),
          !nonLocalEnvs.includes(process.env.NODE_ENV) ? colorize() : format(upperCase)(),
          all(),
          file(thisModule)(),
          timestamp(),
          align(),
          printf(
            info =>
              `[${info.timestamp}] ${info.level}  [${info.fileName}]: ${info.message} ${
                info.error || info.err ? `\n${info.error?.stack_trace || info.err?.stack || '' }` : ''
              }`,
          ),
        ),
      transports: [this.transport],
    });
    return logger;
  }
}

export const WinstonLogger = new WLogger();
