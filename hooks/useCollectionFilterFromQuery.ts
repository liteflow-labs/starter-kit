import invariant from 'ts-invariant'
import { CollectionCondition } from '../graphql'
import useQueryParamMulti from './useQueryParamMulti'
import useQueryParamSingle from './useQueryParamSingle'

export type Filter = {
  chains: number[]
  search: string | null
}

export const convertFilterToCollectionFilter = (
  filter: Filter,
): CollectionCondition => {
  const queryFilter: Partial<CollectionCondition> = {}

  if (filter.chains && filter.chains.length > 0)
    queryFilter.chainIds = filter.chains

  if (filter.search) queryFilter.search = filter.search

  return queryFilter as CollectionCondition
}

const parseToInt = (value?: string): number => {
  invariant(value)
  return parseInt(value, 10)
}

export default function useCollectionFilterFromQuery(): Filter {
  const chains = useQueryParamMulti<number>('chains', { parse: parseToInt })
  const search = useQueryParamSingle('search')

  return {
    chains,
    search,
  }
}
