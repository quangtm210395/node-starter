import { ErrorCode } from '@Errors/ErrorCode';

export class BusinessLogicError extends Error {
  constructor(code: ErrorCode) {
    super(ErrorCode[code]);
  }
}
