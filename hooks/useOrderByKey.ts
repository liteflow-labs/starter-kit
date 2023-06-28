import { useMemo } from 'react'

export function useOrderByKey<T>(
  keys: string[],
  items: T[],
  convertFn: (item: T) => string,
): T[] {
  return useMemo(() => {
    if (!keys) return []
    return keys.reduce((prev, value) => {
      const item = (items || []).find((x) => convertFn(x) === value)
      return item ? [...prev, item] : prev
    }, [] as T[])
  }, [keys, items, convertFn])
}
