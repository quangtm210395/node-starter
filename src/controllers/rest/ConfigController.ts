import { Authorized, Get, JsonController, Post, QueryParam } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { RestRoles } from '@Enums/RestRoles';

import { ConfigService } from '@Services/ConfigService';

@JsonController('/configs')
@OpenAPI({ security: [{ access_token: [] }] })
export class ConfigController {
  constructor(@Logger(module) private readonly logger: winston.Logger, private configService: ConfigService) {}

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
}
