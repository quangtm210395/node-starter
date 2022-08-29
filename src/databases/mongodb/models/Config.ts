import { ObjectId } from 'mongodb';
import { prop as Property, modelOptions, Severity } from '@typegoose/typegoose';
import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'configs',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Config {
  readonly _id: ObjectId;

  @Property({ unique: true })
  key: string;

  @Property()
  value: string;

  @Field()
  @Property({ default: new Date(), required: true })
  createdAt: Date;

  @Field()
  @Property({ default: new Date(), required: true })
  updatedAt: Date;
}
