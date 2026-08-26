export interface Meta {
  limit: number;
  currentPage: number;
  pageCount: number;
  totalCount: number;
}

export interface QueryParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: Meta;
}
