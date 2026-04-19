import { useState, useEffect, useCallback } from 'react'

import { PAGE_SIZE } from '@/constants/common'
import { type QueryParams, type Response } from '@/types/api'

interface UseLoadMoreOptions<T> {
  fetcher: (params: QueryParams) => Promise<Response<T[]>>
  limit?: number
}

export const useLoadMore = <T>({
  fetcher,
  limit = PAGE_SIZE,
}: UseLoadMoreOptions<T>) => {
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    setError('')

    const { data: newData, error: newError } = await fetcher({ page, limit })
    const length = newData?.length

    if (length) {
      setData((prev) => [...prev, ...newData])
    }
    setHasMore(length === limit)
    setPage((prev) => prev + 1)

    if (newError) {
      setError(newError)
    }

    setIsLoading(false)
  }, [fetcher, page, limit, isLoading, hasMore])

  useEffect(() => {
    void handleLoadMore()
  }, [])

  return {
    data,
    isLoading,
    error,
    hasMore,
    onLoadMore: handleLoadMore,
  }
}
