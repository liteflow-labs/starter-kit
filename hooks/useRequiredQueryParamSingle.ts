import invariant from 'ts-invariant'
import useQueryParamSingle from './useQueryParamSingle'

export default function useRequiredQueryParamSingle<T = string>(
  key: string,
  options: {
    parse?: (value: string) => T
  } = {},
): T {
  const value = useQueryParamSingle<T>(key, {
    parse(value) {
      invariant(value)
      return options.parse ? options.parse(value) : (value as T)
    },
  })
  invariant(value)
  return value
}
