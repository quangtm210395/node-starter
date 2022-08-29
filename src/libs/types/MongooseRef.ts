import { ObjectId } from 'mongodb';

export type MongooseRef<T> = T | ObjectId | String;
