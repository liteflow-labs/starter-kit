import { useMemo } from 'react'

export function useOrderByKey<T>(
  keys: string[] | undefined,
  items: T[] | undefined,
  convertFn: (item: T) => string,
): T[] | undefined {
  return useMemo(() => {
    if (!keys || !items) return undefined
    return keys.reduce((prev, value) => {
      const item = items.find((x) => convertFn(x) === value)
      return item ? [...prev, item] : prev
    }, [] as T[])
  }, [keys, items, convertFn])
}
