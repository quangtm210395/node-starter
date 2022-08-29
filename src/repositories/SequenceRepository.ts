import winston from 'winston';
import { Service } from 'typedi';
import { mongoose } from '@typegoose/typegoose';

import { Logger } from '@Decorators/Logger';

import { SequenceModel } from '@Models/models';

@Service()
export class SequenceRepository {
  constructor(@Logger(module) private logger: winston.Logger) {}

  async increment(key: string, session?: mongoose.ClientSession) {
    return SequenceModel.findOneAndUpdate(
      { key },
      { $inc: { value: 1 }, $setOnInsert: { key } },
      { new: true, upsert: true, session },
    );
  }
}
