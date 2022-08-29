import { GraphQLScalarType, Kind } from 'graphql';
import { Decimal128 } from 'mongodb';

export const Decimal128Scalar = new GraphQLScalarType({
  name: 'Decimal128',
  description: 'Mongo decimal 128 bit scalar type',
  serialize(value: unknown): string {
    if (!(value instanceof Decimal128)) {
      throw new Error('Decimal128Scalar can only serialize Decimal128 values');
    }
    return value.toString();
  },
  parseValue(value: unknown): Decimal128 {
    if (typeof value !== 'string') {
      throw new Error('Decimal128Scalar can only parse string values');
    }
    return Decimal128.fromString(value);
  },
  parseLiteral(ast): Decimal128 {
    if (ast.kind !== Kind.STRING) {
      throw new Error('Decimal128Scalar can only parse string values');
    }
    return Decimal128.fromString(ast.value);
  },
});
