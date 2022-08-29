import { ClassType, Field, ObjectType } from 'type-graphql';

export function PaginatedResponse<T>(TClass: ClassType<T>) {
  @ObjectType(`Paginated${TClass.name}Response`)
  class PaginatedResponseClass {
    @Field(types => [TClass], { defaultValue: [], description: 'response items' })
    items: T[];

    @Field({ nullable: true, description: 'total items can be queried' })
    total: number;

    @Field({ defaultValue: 20, description: 'size of the response items' })
    size: number;

    @Field({ defaultValue: 20, description: 'the page number' })
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
  return PaginatedResponseClass;
}
