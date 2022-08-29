import { Container, ObjectType } from 'typedi';

import { createDataLoader, CreateDataLoaderOptions } from '@Libs/graphql';

export function DLoader<S, K, V>(serviceType: ObjectType<S>, 
  options: CreateDataLoaderOptions<K, V> = {}): ParameterDecorator {
  return (object, propertyKey, index) => {
    const dataLoader = createDataLoader<S, K, V>(serviceType, options);
    const propertyName = propertyKey ? propertyKey.toString() : '';
    Container.registerHandler({ object, propertyName, index, value: () => dataLoader });
  };
}

export * from '@Libs/graphql';
