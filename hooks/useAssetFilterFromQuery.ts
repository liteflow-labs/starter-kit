import { useRouter } from 'next/router'
import type { ParsedUrlQuery } from 'querystring'
import invariant from 'ts-invariant'
import {
  AssetFilter,
  AssetToManyAuctionFilter,
  AssetToManyOfferOpenSaleFilter,
  AuctionFilter,
  DatetimeFilter,
  OfferOpenSaleFilter,
  Uint256Filter,
} from '../graphql'
import { parseBigNumber } from './useParseBigNumber'
import useQueryParamSingle from './useQueryParamSingle'

type TraitFilter = {
  type: string
  values: string[]
}

export type Filter = {
  search: string | null
  minPrice: number | null
  maxPrice: number | null
  collection: string | null
  offers: OfferFilter | null
  currencyId: string | null
  traits: TraitFilter[]
}

export enum OfferFilter {
  fixed = 'fixed',
  auction = 'auction',
}

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
  currencies: { id: string; decimals: number }[],
  now: Date,
): AssetFilter[] => {
  const currency =
    currencies.length === 1
      ? currencies[0]
      : currencies.find((x) => x.id === filter.currencyId) || currencies[0]
  const queryFilter = []
  if (filter.search) queryFilter.push(searchFilter(filter.search))
  if (filter.collection) queryFilter.push(collectionFilter(filter.collection))
  if (currency) {
    if (filter.minPrice)
      queryFilter.push(minPriceFilter(filter.minPrice, currency, now))
    if (filter.maxPrice)
      queryFilter.push(maxPriceFilter(filter.maxPrice, currency, now))
  }
  if (filter.offers) queryFilter.push(offersFilter(filter.offers, now))
  if (filter.traits && filter.traits.length > 0)
    queryFilter.push(traitFilter(filter.traits))
  return queryFilter
}

const parseToFloat = (value?: string) => (value ? parseFloat(value) : null)

export default function useAssetFilterFromQuery(
  currencies: { id: string }[],
): Filter {
  const { query } = useRouter()
  const search = useQueryParamSingle('search')
  const minPrice = useQueryParamSingle('minPrice', { parse: parseToFloat })
  const maxPrice = useQueryParamSingle('maxPrice', { parse: parseToFloat })
  const collection = useQueryParamSingle('collection')
  const offers = useQueryParamSingle<OfferFilter>('offers')
  const paramCurrencyId = useQueryParamSingle('currencyId')
  const currencyId =
    currencies.length === 1
      ? currencies[0]!.id
      : currencies.find((x) => x.id === paramCurrencyId)?.id ||
        currencies[0]!.id

  return {
    search,
    minPrice,
    maxPrice,
    collection,
    offers,
    currencyId,
    traits: extractTraitsFromQuery(query),
  }
}
