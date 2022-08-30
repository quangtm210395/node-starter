import { ArgumentValidationError, ForbiddenError, MiddlewareInterface, NextFn, ResolverData, UnauthorizedError } from 'type-graphql';
import winston from 'winston';
import { Service } from 'typedi';

import { Logger } from '@Decorators/Logger';

import { GraphqlContext } from '@Libs/types/GraphqlContext';

import { BusinessLogicError } from '@Errors/BusinessLogicError';

@Service()
export class ErrorHandlerMiddleware implements MiddlewareInterface<GraphqlContext> {
  constructor(@Logger(module) private readonly logger: winston.Logger) {}

  async use({ context, info }: ResolverData<any>, next: NextFn) {
    const { res } = context;
    try {
      return await next();
    } catch (error) {
      this.logger.error('error occurs: ', error);
      if (error instanceof UnauthorizedError) {
        res.status(401).json({
          errors: [{ message: 'UnauthorizedError', extensions: { functionName: info.fieldName, code: 'UNAUTHORIZED' } }],
        });
        return;
      } else if (error instanceof ForbiddenError) {
        res.status(403).json({
          errors: [{ message: 'ForbiddenError', extensions: { functionName: info.fieldName, code: 'FORBIDDEN' } }],
        });
        return;
      } else if (error instanceof ArgumentValidationError) {
        res.status(400).json({
          errors: [{
            message: 'ArgumentValidationError',
            extensions: {
              functionName: info.fieldName,
              code: 'BAD_USER_INPUT',
              exception: error,
            },
          }],
        });
        return;
      } else if (error instanceof BusinessLogicError) {
        res.status(500).json({
          errors: [{
            message: 'BusinessLogicError',
            extensions: {
              functionName: info.fieldName,
              code: error.message,
              exception: error,
            },
          }],
        });
        return;
      }
      throw error;
    }
  }
}
