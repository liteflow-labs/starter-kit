import { useRouter } from 'next/router'
import type { ParsedUrlQuery } from 'querystring'

export function singleQueryParam<T = string>(
  query: ParsedUrlQuery,
  key: string,
  options: {
    defaultValue?: T
    parse?: (value?: string) => T
  } = {},
): T | null {
  const value = query[key]
  if (value === undefined) return options.defaultValue || null
  const result = Array.isArray(value) ? value[0] : value
  return options.parse ? options.parse(result) : (result as unknown as T)
}

export default function useQueryParamSingle<T = string>(
  key: string,
  options: {
    defaultValue?: T
    parse?: (value?: string) => T
  } = {},
): T | null {
  const { query } = useRouter()
  return singleQueryParam<T>(query, key, options)
}
