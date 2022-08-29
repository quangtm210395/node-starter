import { Container } from 'typedi';

import { WinstonLogger } from '@Libs/WinstonLogger';

export function Logger(_module: NodeModule): ParameterDecorator {
  return (object, propertyKey, index): any => {
    const logger = WinstonLogger.create(_module);
    const propertyName = propertyKey ? propertyKey.toString() : '';
    Container.registerHandler({ object, propertyName, index, value: () => logger } as any);
  };
}
