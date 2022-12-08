import { useMemo } from 'react'

export default function useOrderById<T extends { id: string }>(
  ids: string[],
  items?: T[],
): T[] {
  return useMemo(() => {
    return ids.reduce((prev, value) => {
      const item = (items || []).find((x) => x.id === value)
      return item ? [...prev, item] : prev
    }, [] as T[])
  }, [ids, items])
}
