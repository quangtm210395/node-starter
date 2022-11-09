import { IsNumber } from 'class-validator';

export interface ClassType<T = any> {
  new (...args: any[]): T;
}
export class HttpPaginatedResponse<T> {
  items: Array<T>;

  @IsNumber()
  total: number;

  @IsNumber()
  size: number;

  @IsNumber()
  page: number;

  withItems(items: T[]) {
    this.items = items;
    return this;
  }

  withSize(limit: number) {
    this.size = limit;
    return this;
  }

  withPage(page: number) {
    this.page = page;
    return this;
  }

  withTotal(total: number) {
    this.total = total;
    return this;
  }
}
