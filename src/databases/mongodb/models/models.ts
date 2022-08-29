import { getModelForClass } from '@typegoose/typegoose';

import { Config } from '@Models/Config';
import { Sequence } from '@Models/Sequence';

export const SequenceModel = getModelForClass(Sequence, { schemaOptions: { collection: 'sequences' } });
export const ConfigModel = getModelForClass(Config, { schemaOptions: { collection: 'configs' } });
