import { Arg, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import winston from 'winston';
import DataLoader from 'dataloader';

import { Logger } from '@Decorators/Logger';
import { DLoader } from '@Decorators/DLoader';

import { DemoService } from '@Services/DemoService';

@Service()
@Resolver()
export class DemoResolver {
  constructor(
    @Logger(module) private readonly logger: winston.Logger,
    @DLoader<DemoService, any, any>(DemoService, {
      key: '_id',
      method: 'findByIds',
      multiple: false,
    }) private demoLoader: DataLoader<string, any, any>,
  ) {}

  @Query(returns => String)
  async demo(@Arg('input') input: string) {
    return input;
  }

  @Query(returns => String)
  async dl(@Arg('input') input: string) {
    const d = await this.demoLoader.load(input);
    console.log('d: ', d);
    return d ? d.name : '';
  }
}
