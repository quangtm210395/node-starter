import { prop as Property, modelOptions, pre, Severity } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';

import { preSaveMiddleware } from '@Middlewares/mongoPreSaveMiddleware';
import { preUpdateMiddleware } from '@Middlewares/mongoPreUpdateMiddleware';

@pre<any>('save', preSaveMiddleware)
@pre<any>(new RegExp('^.*update.*', 'i'), preUpdateMiddleware)
@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'sequences',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    versionKey: 'version',
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Sequence {
  _id: ObjectId;

  @Property({ required: true, unique: true })
  key: string;

  @Property({ required: true, default: 0 })
  value: number;
}