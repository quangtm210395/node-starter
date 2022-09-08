import { Inject, Service } from 'typedi';
import { DataSource, DeepPartial, EntityRepository, Repository } from 'typeorm';
import winston from 'winston';

import { Logger } from '@Decorators/Logger';

import { User } from '@Entities/User';

import { BaseOrmRepository } from '@Repositories/BaseOrmRepository';

@Service()
export class UserRepository extends BaseOrmRepository<User> {
  constructor(
    @Logger(module) private logger: winston.Logger,
    @Inject('dataSource') private dataSource: DataSource,
  ) {
    super(dataSource, User);
  }

  async create(user: DeepPartial<User>) {
    return this.repo.save(user);
  }
}
