import { PreMiddlewareFunction } from 'mongoose';

export const preSaveMiddleware: PreMiddlewareFunction<any> = function (next) {
  this.createdAt = new Date();
  this.updatedAt = new Date();
  next();
};
