import { Service } from 'typedi';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { ConfigModel } from '@Models/models';

@Service()
export class ConfigRepository {
  constructor(@Logger(module) private logger: winston.Logger) {}

  async get(key: string) {
    return ConfigModel.findOne({ key });
  }

  async getByMultiKeys(keys: string[]) {
    return ConfigModel.find({ key: { $in: keys } });
  }

  async upsert(key: string, value: string) {
    return ConfigModel.findOneAndUpdate({ key }, {
      $set: { value },
      $setOnInsert: { key },
    }, { new: true, upsert: true });
  }
}
