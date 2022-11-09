import { Authorized, Body, Get, JsonController, Patch, Post, QueryParam, QueryParams } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import winston from 'winston';
import { IsEnum } from 'class-validator';
import { Service } from 'typedi';

import { Logger } from '@Decorators/Logger';

import { WinstonLogger } from '@Libs/WinstonLogger';

import { RestRoles } from '@Enums/RestRoles';
import { LogLevel } from '@Enums/LogLevel';

import { ErrorCode } from '@Errors/ErrorCode';
import { BusinessLogicError } from '@Errors/BusinessLogicError';

import { ConfigService } from '@Services/ConfigService';

import { TestBody } from '@Rests/types/TestBody';
import { ChangeLogLevelReq } from '@Rests/types/ChangeLogLevelReq';

@Service()
@JsonController('/configs')
@OpenAPI({ security: [{ BearerToken: [] }] })
export class ConfigController {
  constructor(
    @Logger(module) private readonly logger: winston.Logger,
    private configService: ConfigService,
  ) {}

  @Authorized(RestRoles.ADMIN)
  @Post('/expire')
  public async expire(@QueryParam('prefix') prefix: string) {
    return await this.configService.expireConfigs(prefix);
  }

  @Authorized(RestRoles.ADMIN)
  @Get('/keys')
  public async keys(@QueryParam('prefix') prefix: string) {
    return await this.configService.keys(prefix);
  }

  @Patch('/log-level')
  public async changeLogLevel(
    @QueryParams() params: ChangeLogLevelReq,
  ) {
    this.logger.info('changeLogLevel:: changing log level to: ', params.level);
    WinstonLogger.changeLogLevel(params.level);
    return 'OK';
  }

  // @Authorized(RestRoles.ADMIN)
  @Post('/test')
  public async test(@Body() body: TestBody) {
    this.logger.debug('body: ', body);
    this.logger.info('body: ', body);
    if (body.name === 'quang') {
      throw new BusinessLogicError(ErrorCode.PATTERN_CODE, 'quang', 'hikari');
    }
    if (body.name === 'quang1') {
      throw new BusinessLogicError(ErrorCode.NON_PATTERN_CODE);
    }
    return body;
  }
}
