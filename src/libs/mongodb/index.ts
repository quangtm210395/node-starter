import { AnyParamConstructor, BeAnObject, ModelType, ReturnModelType } from '@typegoose/typegoose/lib/types';
import { mongoose } from '@typegoose/typegoose';

export function getModelForDb<T extends AnyParamConstructor<any>, QueryHelpers = BeAnObject>
(clazz: T, databaseName: string, model: mongoose.Model<InstanceType<T>>): ModelType<T, QueryHelpers> {
  const db = mongoose.connection.useDb(databaseName, { useCache: true, noListener: true });

  const DbModel = getModel(db, model) as ModelType<T, QueryHelpers>;

  return DbModel;
}

export function getModelByType<T extends AnyParamConstructor<any>, QueryHelpers = BeAnObject>
(clazz: T, db: mongoose.Connection, model: mongoose.Model<InstanceType<T>>) {
  return db.model(model.modelName, model.schema) as ReturnModelType<T, QueryHelpers>;
}

export function getModel(db: mongoose.Connection, model: mongoose.Model<InstanceType<any>>) {
  return db.model(model.modelName, model.schema);
}

