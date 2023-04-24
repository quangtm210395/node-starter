import { AnyParamConstructor, ReturnModelType } from '@typegoose/typegoose/lib/types';
import { DocumentType, mongoose } from '@typegoose/typegoose';
import  { FilterQuery } from 'mongoose';

import { SortDirection } from '@Enums/SortDirection';

/**
 * A base class for all repository
 * It will define most of the basic query functions
 * 
 */
export abstract class BaseRepository<T extends AnyParamConstructor<any>, C> {
  // constructor() {}

  abstract getModel(): ReturnModelType<T>;

  async create(c: C, session?: mongoose.ClientSession) {
    const result = await this.getModel().create([c], { session });
    return result[0];
  }

  async findById(id: string) {
    return this.getModel().findById(id);
  }

  async findOneByFilters(filters: FilterQuery<DocumentType<C>>) {
    return this.getModel().findOne(filters);
  }

  async countByFilters(filters: FilterQuery<DocumentType<C>>) {
    return this.getModel().countDocuments(filters);
  }

  async findByFilters(filters: FilterQuery<DocumentType<C>>, sortBy?: string, sortDirection?: SortDirection) {
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortDirection;
    }
    return this.getModel().find(filters).sort(sort);
  }

  async findByFiltersAndPagination(
    filters: FilterQuery<DocumentType<C>>,
    skip: number,
    limit: number,
    sortBy?: string,
    sortDirection?: SortDirection,
  ) {
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortDirection;
    }
    return this.getModel().find(filters).sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async bulkWrite(writes: any[]) {
    return this.getModel().bulkWrite(writes);
  }
}
