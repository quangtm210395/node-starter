import { registerEnumType } from 'type-graphql';

export enum JwtTokenType {
  EXTERNAL_USER_JWT = 'EXTERNAL_USER_JWT',
  INTERNAL_USER_JWT = 'INTERNAL_USER_JWT',
}

registerEnumType(JwtTokenType, {
  name: 'JwtTokenType',
  description: 'Token type',
});
