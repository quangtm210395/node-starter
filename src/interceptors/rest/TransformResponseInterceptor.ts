import { Model } from 'mongoose';
import { Action, Interceptor, InterceptorInterface } from 'routing-controllers';
import { Service } from 'typedi';

import { convertDocument } from '@Middlewares/graphql/TypegooseMiddleware';

@Service()
@Interceptor()
export class TransformResponseInterceptor implements InterceptorInterface {
  intercept(action: Action, result: any) {
    if (Array.isArray(result)) {
      return result.map(item => (item instanceof Model ? convertDocument(item) : item)).filter(item => !!item);
    }

    if (result instanceof Model) {
      return convertDocument(result);
    }

    return result;
  }
}
