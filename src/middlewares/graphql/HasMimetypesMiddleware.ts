import {  MiddlewareFn } from 'type-graphql';

import { WinstonLogger } from '@Libs/WinstonLogger';
import { GraphqlContext } from '@Libs/types/GraphqlContext';

import { BusinessLogicError } from '@Errors/BusinessLogicError';
import { ErrorCode } from '@Errors/ErrorCode';

const logger = WinstonLogger.create(module);

export function HasMimetypes(mimetypes: any[]): MiddlewareFn<GraphqlContext> {
  return async ({ context }, next) => {
    const { req } = context;
    logger.info('HasMimetypes:: request variables: ', req.body.variables, 'mimetypes: ', mimetypes);
    if (mimetypes && mimetypes.length) {
      const mimetype = req.body.variables?.file?.file?.mimetype;
      if (!mimetypes.includes(mimetype)) {
        throw new BusinessLogicError(ErrorCode.FILE_IS_NOT_ALLOWED);
      }
    }
    return next();
  };
}
