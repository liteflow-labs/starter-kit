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
  return {
    chainIds: filter.chains,
    ids: null,
    mintType: null,
    search: filter.search,
  }
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
