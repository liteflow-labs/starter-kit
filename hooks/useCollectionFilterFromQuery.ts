import invariant from 'ts-invariant'
import { CollectionFilter, IntFilter } from '../graphql'
import useQueryParamMulti from './useQueryParamMulti'
import useQueryParamSingle from './useQueryParamSingle'

export type Filter = {
  chains: number[]
  search: string | null
}

const chainFilter = (chains: number[]): CollectionFilter =>
  ({
    chainId: { in: chains } as IntFilter,
  } as CollectionFilter)

const searchFilter = (search: string): CollectionFilter =>
  ({
    or: [
      { name: { includesInsensitive: search } } as CollectionFilter,
      { address: { includesInsensitive: search } } as CollectionFilter,
      { description: { includesInsensitive: search } } as CollectionFilter,
    ],
  } as CollectionFilter)

export const convertFilterToCollectionFilter = (
  filter: Filter,
): CollectionFilter[] => {
  const queryFilter = []
  if (filter.chains && filter.chains.length > 0)
    queryFilter.push(chainFilter(filter.chains))
  if (filter.search) queryFilter.push(searchFilter(filter.search))
  return queryFilter
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
