import { registerEnumType } from 'type-graphql';

export enum SortDirection {
  asc = 1,
  desc = -1,
}

registerEnumType(SortDirection, {
  name: 'SortDirection',
});
