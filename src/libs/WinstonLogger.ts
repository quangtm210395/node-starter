import path from 'path';

import winston, { format, transports, Logger } from 'winston';
import { SPLAT } from 'triple-beam';
import { isObject, trimEnd } from 'lodash';
import stringify from 'json-stringify-safe';

import { env } from '@Libs/env';

import { LogLevel } from '@Enums/LogLevel';

const { combine, timestamp, printf, align, errors, colorize } = format;

function formatObject(param: any) {
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
  return { ...info, message };
});

const file = (thisModule?: NodeModule) =>
  format((info: any) => {
    if (!thisModule) {
      return info;
    }
    const BASE_PATH = path.resolve('.');
    const fileName = thisModule.filename;
    const moduleName = fileName.split(BASE_PATH)[1];
    return { ...info, moduleName };
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
      format: env.log.json ? format.json() : combine(
        ignoreAuthorization(),
        errors({ stack: true }),
        !nonLocalEnvs.includes(process.env.NODE_ENV) ? colorize() : format(upperCase)(),
        all(),
        file(thisModule)(),
        timestamp(),
        align(),
        printf(
          info =>
            `[${info.timestamp}] ${info.level}  [${info.moduleName}]: ${info.message} ${
              info.stack ? `\n${info.stack}` : ''
            }`,
        ),
      ),
      transports: [this.transport],
    });
    return logger;
  }
}

export const WinstonLogger = new WLogger();
