import invariant from 'ts-invariant'
import useQueryParamSingle from './useQueryParamSingle'

export default function useOrderByQuery<T>(defaultValue: T): T {
  const orderBy = useQueryParamSingle<T>('orderBy', {
    defaultValue: defaultValue,
  })
  invariant(orderBy, 'orderBy is falsy')
  return orderBy
}
