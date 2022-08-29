import { registerEnumType } from 'type-graphql';

export enum UserRoles {
  GUILD_MANAGER = 'GUILD_MANAGER',
  OWNER = 'OWNER',
  SCHOLAR = 'SCHOLAR',
}

registerEnumType(UserRoles, {
  name: 'UserRoles',
});
