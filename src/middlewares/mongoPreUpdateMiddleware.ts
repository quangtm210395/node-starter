import { PreMiddlewareFunction, Query } from 'mongoose';

export const preUpdateMiddleware: PreMiddlewareFunction<Query<any, any>> = function (next) {
  const update: any = this.getUpdate();
  const options = this.getOptions();
  if (update.version != null) {
    delete update.version;
  }
  const keys = ['$set', '$setOnInsert'];
  keys.forEach(key => {
    if (update[key] != null && update[key].version != null) {
      delete update[key].version;
      if (Object.keys(update[key]).length === 0) {
        delete update[key];
      }
    }
  });
  update.$inc = update.$inc || {};
  update.$inc.version = 1;
  update.$set = update.$set || {};
  update.$set.updatedAt = new Date();
  if (options?.upsert) {
    update.$setOnInsert = update.$setOnInsert || {};
    update.$setOnInsert.createdAt =update.$setOnInsert.createdAt || new Date();
  }
  next();
};
