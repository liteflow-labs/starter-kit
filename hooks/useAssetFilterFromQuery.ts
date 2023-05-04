import { useRouter } from 'next/router'
import type { ParsedUrlQuery } from 'querystring'
import invariant from 'ts-invariant'
import {
  AssetFilter,
  AssetToManyAuctionFilter,
  AssetToManyOfferOpenSaleFilter,
  AuctionFilter,
  DatetimeFilter,
  IntFilter,
  OfferOpenSaleFilter,
  Uint256Filter,
} from '../graphql'
import { parseBigNumber } from './useParseBigNumber'
import useQueryParamMulti from './useQueryParamMulti'
import useQueryParamSingle from './useQueryParamSingle'

type TraitFilter = {
  type: string
  values: string[]
}

export type Filter = {
  chains: number[]
  search: string | null
  minPrice: number | null
  maxPrice: number | null
  collection: string | null
  offers: OfferFilter | null
  currency: {
    id: string
    decimals: number
  } | null
  traits: TraitFilter[]
}

export enum OfferFilter {
  fixed = 'fixed',
  auction = 'auction',
}

const chainFilter = (chains: number[]): AssetFilter =>
  ({
    chainId: { in: chains } as IntFilter,
  } as AssetFilter)

const searchFilter = (search: string): AssetFilter =>
  ({
    or: [
      { name: { includesInsensitive: search } } as AssetFilter,
      { description: { includesInsensitive: search } } as AssetFilter,
      { creatorAddress: { includesInsensitive: search } } as AssetFilter,
    ],
  } as AssetFilter)

const traitFilter = (traits: TraitFilter[]): AssetFilter =>
  ({
    and: traits.map(({ type, values }) => ({
      traits: {
        some: {
          type: { equalTo: type },
          value: { in: values },
        },
      },
    })),
  } as AssetFilter)

const collectionFilter = (collection: string): AssetFilter => {
  const [chainId, address] = collection.split('-')
  return {
    collection: {
      chainId: { equalTo: chainId && parseInt(chainId, 10) },
      address: { equalTo: address },
    },
  } as AssetFilter
}

const minPriceFilter = (
  minPrice: number,
  currency: { id: string; decimals: number },
  date: Date,
): AssetFilter =>
  ({
    sales: {
      some: {
        expiredAt: { greaterThan: date },
        availableQuantity: { greaterThan: '0' },
        currencyId: { equalTo: currency.id },
        unitPrice: {
          greaterThanOrEqualTo: parseBigNumber(
            minPrice.toString(),
            currency.decimals,
          ).toString(),
        } as Uint256Filter,
      } as OfferOpenSaleFilter,
    } as AssetToManyOfferOpenSaleFilter,
  } as AssetFilter)

const maxPriceFilter = (
  maxPrice: number,
  currency: { id: string; decimals: number },
  date: Date,
): AssetFilter =>
  ({
    sales: {
      some: {
        expiredAt: { greaterThan: date },
        availableQuantity: { greaterThan: '0' },
        currencyId: { equalTo: currency.id },
        unitPrice: {
          lessThanOrEqualTo: parseBigNumber(
            maxPrice.toString(),
            currency.decimals,
          ).toString(),
        } as Uint256Filter,
      } as OfferOpenSaleFilter,
    } as AssetToManyOfferOpenSaleFilter,
  } as AssetFilter)

const offersFilter = (offers: OfferFilter, date: Date): AssetFilter => {
  if (offers === OfferFilter.auction) {
    return {
      auctions: {
        some: {
          endAt: { greaterThan: date } as DatetimeFilter,
        } as AuctionFilter,
      } as AssetToManyAuctionFilter,
    } as AssetFilter
  }
  if (offers === OfferFilter.fixed) {
    return {
      sales: {
        some: {
          expiredAt: { greaterThan: date },
          availableQuantity: { greaterThan: '0' },
        },
      },
    } as AssetFilter
  }
  invariant(false, 'Invalid offer filter')
}

export const extractTraitsFromQuery = (
  query: ParsedUrlQuery,
): TraitFilter[] => {
  const traits: TraitFilter[] = []
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

export const convertFilterToAssetFilter = (
  filter: Filter,
  now: Date,
): AssetFilter[] => {
  const queryFilter = []
  if (filter.chains && filter.chains.length > 0)
    queryFilter.push(chainFilter(filter.chains))
  if (filter.search) queryFilter.push(searchFilter(filter.search))
  if (filter.collection) queryFilter.push(collectionFilter(filter.collection))
  if (filter.currency) {
    if (filter.minPrice)
      queryFilter.push(minPriceFilter(filter.minPrice, filter.currency, now))
    if (filter.maxPrice)
      queryFilter.push(maxPriceFilter(filter.maxPrice, filter.currency, now))
  }
  if (filter.offers) queryFilter.push(offersFilter(filter.offers, now))
  if (filter.traits && filter.traits.length > 0)
    queryFilter.push(traitFilter(filter.traits))
  return queryFilter
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
  const offers = useQueryParamSingle<OfferFilter>('offers')
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
