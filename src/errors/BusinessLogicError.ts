import { formatWithArgs } from '@Libs/stringHelpers';

import { BasicError } from '@Errors/BasicError';
import { ErrorCode } from '@Errors/ErrorCode';

export class BusinessLogicError extends BasicError {
  constructor(code: ErrorCode, ...args: any[]) {
    super(code.valueOf());
    this.name = 'BusinessLogicError';
    let message = code.toString();
    if (args.length > 0) {
      message = formatWithArgs(message, args);
    }
    this.message = message;
  }
}
