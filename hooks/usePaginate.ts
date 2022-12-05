import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'

export default function usePaginate(): [
  (page: number) => void,
  (limit: string) => void,
  { loading: boolean },
] {
  const { push, pathname, query } = useRouter()
  const [loading, setLoading] = useState(false)
  const changePage = useCallback(
    async (page: number) => {
      setLoading(true)
      await push({ pathname, query: { ...query, page } }).finally(() =>
        setLoading(false),
      )
    },
    [pathname, push, query],
  )
  const changeLimit = useCallback(
    async (limit: string) => {
      setLoading(true)
      await push({ pathname, query: { ...query, limit, page: 1 } }).finally(
        () => setLoading(false),
      )
    },
    [pathname, push, query],
  )
  return [changePage, changeLimit, { loading }]
}
