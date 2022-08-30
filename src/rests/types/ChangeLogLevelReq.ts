import { IsEnum } from 'class-validator';

import { LogLevel } from '@Enums/LogLevel';

export class ChangeLogLevelReq {
  @IsEnum(LogLevel)
  level: LogLevel;
}
