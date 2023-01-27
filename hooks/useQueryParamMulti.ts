import { useRouter } from 'next/router'
import type { ParsedUrlQuery } from 'querystring'

export function multiQueryParam<T = string>(
  query: ParsedUrlQuery,
  key: string,
  options: {
    defaultValue?: T[]
    convert?: (value?: string) => T
  } = {},
): T[] {
  const value = query[key]
  if (value === undefined) return options.defaultValue || []
  const result = Array.isArray(value) ? value : [value]
  return options.convert
    ? result.map(options.convert)
    : (result as unknown as T[])
}

export default function useQueryParamMulti<T = string>(
  key: string,
  options: {
    defaultValue?: T[]
    convert?: (value?: string) => T
  } = {},
): T[] {
  const { query } = useRouter()
  return multiQueryParam<T>(query, key, options)
}
