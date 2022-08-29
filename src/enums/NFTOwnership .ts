import { registerEnumType } from 'type-graphql';

export enum NFTOwnership {
    OWNER = 'OWNER',
    BORROWING = 'BORROWING',
}

registerEnumType(NFTOwnership, {
  name: 'NFTOwnership', // this one is mandatory
  description: 'The elements of NFT ownerships', // this one is optional
});
      