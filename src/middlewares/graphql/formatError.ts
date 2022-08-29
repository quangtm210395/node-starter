import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { ArgumentValidationError } from 'type-graphql';
import { ForbiddenError } from 'apollo-server-errors';

import { WinstonLogger } from '@Libs/WinstonLogger';

import { ErrorCode } from '@Errors/ErrorCode';

// import { ArgumentValidationError } from '@Errors/ArgumentValidationError';

const logger = WinstonLogger.create(module);

export const formatError = (error: GraphQLError): GraphQLFormattedError<Record<string, any>> => {
  if (error.originalError && error.originalError instanceof ArgumentValidationError) {
    logger.error('errorHandlerMiddleware:: ', error.originalError);
    const extensions: Record<string, any> = {};
    for (let val of error.originalError.validationErrors) {
      extensions[val.property] = val;
    }
    return new GraphQLError(
      ErrorCode[ErrorCode.ARGUMENT_VALIDATION_ERROR],
      error.nodes,
      error.source,
      error.positions,
      error.path,
      error.originalError,
      extensions,
    );
  }
  logger.error('errorHandlerMiddleware:: UnknownError: ', error.constructor.name, error);
  // throw new GraphQLError(
  //   error.message,
  //   error.nodes,
  //   error.source,
  //   error.positions,
  //   error.path,
  //   // error.originalError,
  // );
  throw new ForbiddenError(error.constructor.name);
};
