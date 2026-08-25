export interface Meta {
  limit: number;
  currentPage: number;
  pageCount: number;
  totalCount: number;
}

export interface QueryParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: Meta;
}
