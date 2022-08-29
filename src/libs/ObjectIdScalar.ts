import { GraphQLScalarType, Kind } from 'graphql';
import { ObjectId } from 'mongodb';

export const ObjectIdScalar = new GraphQLScalarType({
  name: 'ObjectId',
  description: 'Mongo object id scalar type',
  serialize(value: unknown): string {
    if (value instanceof ObjectId) {
      return value.toHexString();
    } else if (typeof value === 'string') {
      return value;
    } else {
      throw new Error(
        `ObjectIdScalar cannot be serialized from a non string or non ObjectId type ${JSON.stringify(value)}`,
      );
    }
  },
  parseValue(value: unknown): ObjectId {
    if (typeof value !== 'string') {
      throw new Error('ObjectIdScalar can only parse string values');
    }
    return new ObjectId(value);
  },
  parseLiteral(ast): ObjectId {
    if (ast.kind !== Kind.STRING) {
      throw new Error('ObjectIdScalar can only parse string values');
    }
    return new ObjectId(ast.value);
  },
});
