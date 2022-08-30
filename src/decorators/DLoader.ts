import { Container, Constructable } from 'typedi';

import { createDataLoader, CreateDataLoaderOptions } from '@Libs/graphql';

export function DLoader<S, K, V>(serviceType: Constructable<S>,
  options: CreateDataLoaderOptions<K, V> = {}): ParameterDecorator {
  return (object, propertyKey, index) => {
    const dataLoader = createDataLoader<S, K, V>(serviceType, options);
    const propertyName = propertyKey ? propertyKey.toString() : '';
    Container.registerHandler({ object: object as any, propertyName, index, value: () => dataLoader });
  };
}

export * from '@Libs/graphql';
