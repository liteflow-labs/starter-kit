import { useMemo } from 'react'

export function useOrderByAddress<T extends { address: string }>(
  ids?: string[],
  items?: T[],
): T[] {
  return useMemo(() => {
    if (!ids) return []
    return ids.reduce((prev, value) => {
      const item = (items || []).find((x) => x.address === value)
      return item ? [...prev, item] : prev
    }, [] as T[])
  }, [ids, items])
}
