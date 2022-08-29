
export class HttpPaginatedResponse<T> {
    items: T[];

    total: number;

    size: number;

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
