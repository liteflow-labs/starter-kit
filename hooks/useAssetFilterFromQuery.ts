import { useRouter } from 'next/router'
import type { ParsedUrlQuery } from 'querystring'
import invariant from 'ts-invariant'
import { AssetCondition, AssetTraitsCondition } from '../graphql'
import { parseBigNumber } from './useParseBigNumber'
import useQueryParamMulti from './useQueryParamMulti'
import useQueryParamSingle from './useQueryParamSingle'

export type Filter = {
  chains: number[]
  search: string | null
  minPrice: number | null
  maxPrice: number | null
  collection: string | null
  offers: OfferFilterType | null
  currency: {
    id: string
    decimals: number
  } | null
  traits: AssetTraitsCondition[]
  collectionSearch?: string
  propertySearch?: string
}

export enum OfferFilterType {
  fixed = 'fixed',
  bids = 'bids',
}

export const extractTraitsFromQuery = (
  query: ParsedUrlQuery,
): AssetTraitsCondition[] => {
  const traits: AssetTraitsCondition[] = []
  for (const typeQuery in query) {
    const typeMatch = typeQuery.match(/^traits\[(.+)\]$/)
    if (!typeMatch) continue
    const type = typeMatch[1]
    if (!type) continue
    const values = query[typeQuery]
    if (!values) continue
    traits.push({
      type,
      values: Array.isArray(values) ? values : [values],
    })
  }
  return traits
}

export const convertFilterToAssetFilter = (filter: Filter): AssetCondition => {
  const queryFilter: Partial<AssetCondition> = {}

  if (filter.chains && filter.chains.length > 0)
    queryFilter.chainIds = filter.chains

  if (filter.search) queryFilter.search = filter.search

  if (filter.traits && filter.traits.length > 0)
    queryFilter.traits = filter.traits

  if (filter.collection) {
    const [chainId, collectionAddress] = filter.collection.split('-')
    queryFilter.chainId = chainId ? parseInt(chainId, 10) : null
    queryFilter.collectionAddress = collectionAddress ? collectionAddress : null
  }

  if (filter.currency) {
    queryFilter.listings = {
      currencyId: filter.currency.id,
      makerAddress: null,
      maxUnitPrice: filter.maxPrice
        ? parseBigNumber(
            filter.maxPrice.toString(),
            filter.currency.decimals,
          ).toString()
        : null,
      minUnitPrice: filter.minPrice
        ? parseBigNumber(
            filter.minPrice.toString(),
            filter.currency.decimals,
          ).toString()
        : null,
      status: 'ACTIVE' as const,
    }
  }

  if (
    filter.offers === OfferFilterType.fixed &&
    !queryFilter.listings // If we already have a listing filter, we don't need to add the listing.status filter because it's already set
  ) {
    queryFilter.listings = {
      currencyId: null,
      makerAddress: null,
      maxUnitPrice: null,
      minUnitPrice: null,
      status: 'ACTIVE' as const,
    }
  }

  if (filter.offers === OfferFilterType.bids) {
    queryFilter.openOffers = {
      currencyId: null,
      maxUnitPrice: null,
      minUnitPrice: null,
      status: 'ACTIVE' as const,
    }
  }

  return queryFilter as AssetCondition
}

const parseToFloat = (value?: string) => (value ? parseFloat(value) : null)
const parseToInt = (value?: string): number => {
  invariant(value)
  return parseInt(value, 10)
}

export default function useAssetFilterFromQuery(): Filter {
  const { query } = useRouter()
  const chains = useQueryParamMulti<number>('chains', { parse: parseToInt })
  const search = useQueryParamSingle('search')
  const minPrice = useQueryParamSingle('minPrice', { parse: parseToFloat })
  const maxPrice = useQueryParamSingle('maxPrice', { parse: parseToFloat })
  const collection = useQueryParamSingle('collection')
  const offers = useQueryParamSingle<OfferFilterType>('offers')
  const currencyId = useQueryParamSingle('currency')
  const currencyDecimals = useQueryParamSingle('decimals', {
    parse: parseToInt,
  })

  return {
    chains,
    search,
    minPrice,
    maxPrice,
    collection,
    offers,
    currency: currencyId
      ? {
          id: currencyId,
          decimals: currencyDecimals || 18,
        }
      : null,
    traits: extractTraitsFromQuery(query),
  }
}
