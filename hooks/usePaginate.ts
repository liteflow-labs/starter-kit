import { useRouter } from 'next/router'
import { useCallback } from 'react'

export default function usePaginate(): [
  (page: number) => void,
  (limit: string) => void,
] {
  const { push, pathname, query } = useRouter()
  const changePage = useCallback(
    async (page: number) => push({ pathname, query: { ...query, page } }),
    [pathname, push, query],
  )
  const changeLimit = useCallback(
    async (limit: string) =>
      push({ pathname, query: { ...query, limit, page: 1 } }),
    [pathname, push, query],
  )
  return [changePage, changeLimit]
}
