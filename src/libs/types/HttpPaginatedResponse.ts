import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

export interface ClassType<T = any> {
  new (...args: any[]): T;
}
export function HttpPaginatedResponse<T>(TClass: ClassType<T>) {
  class HttpPaginatedResponseClass {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(type => TClass)
    items: T[];

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
  return HttpPaginatedResponseClass;
}
