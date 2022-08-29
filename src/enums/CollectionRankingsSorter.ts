import { registerEnumType } from 'type-graphql';

export enum CollectionRankingsSorter {
    TOTAL_VALUE_LOCK = 'TOTAL_VALUE_LOCK',
    FLOOR_INITIAL_PRICE_PRICE = 'FLOOR_INITIAL_PRICE_PRICE',
    LISTED_AMOUNT = 'LISTED_AMOUNT'
}

registerEnumType(CollectionRankingsSorter, {
  name: 'CollectionRankingsSorter', // this one is mandatory
  description: 'The elements of ranking sorters', // this one is optional
});
    