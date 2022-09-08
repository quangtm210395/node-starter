import { Service } from 'typedi';
import { DataSource, Repository, EntityTarget, ObjectLiteral } from 'typeorm';

@Service()
export abstract class BaseOrmRepository<E extends ObjectLiteral> {
  protected repo: Repository<E>;

  constructor(
    dataSource: DataSource,
    target: EntityTarget<E>,
  ) {
    this.repo = dataSource.getRepository<E>(target);
  }
}
