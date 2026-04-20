export interface QueryParams {
  page?: number
  limit?: number
  sort?: string
}

export interface ResponseMeta {
  limit: number
  currentPage: number
  pageCount: number
  totalCount: number
}

export interface Response<T> {
  data: T
  error?: string
  message?: string
  meta?: ResponseMeta
}
