import { GraphQLScalarType, Kind } from 'graphql';

export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime scalar type',
  serialize(value: unknown): Date {
    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else if (typeof value === 'number') {
      date = new Date(value);
    }
    if (!date || date.toString() === 'Invalid Date')
      throw new Error(
        `DateTimeScalar cannot be serialized from a non string, non numeric or non Date type ${JSON.stringify(value)}`,
      );
    return date;
  },
  parseValue(value: unknown): Date {
    if (typeof value !== 'string') {
      throw new Error('DateTimeScalar can only parse string values');
    }
    return new Date(value);
  },
  parseLiteral(ast): Date {
    if (ast.kind !== Kind.STRING) {
      throw new Error('DateTimeScalar can only parse string values');
    }
    return new Date(ast.value);
  },
});
