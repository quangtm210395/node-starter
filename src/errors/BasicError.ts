import { StatusCodes } from 'http-status-codes';

import { ErrorCode } from '@Errors/ErrorCode';

export class BasicError extends Error {
  httpCode: StatusCodes;
  constructor(message: string, httpCode = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'BasicError';
    this.message = message;
    this.httpCode = httpCode;
  }
}
