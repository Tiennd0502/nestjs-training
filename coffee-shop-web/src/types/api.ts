export interface QueryParams {
  page?: number
  limit?: number
  sort?: string
}

export interface Response<T> {
  data: T
  error?: string
  message?: string
  meta?: {
    limit: number
    currentPage: number
    pageCount: number
    totalCount: number
  }
}
