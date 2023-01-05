// Temporary file to centralize all the conversions.
// This file will be removed when the whole migration of the components is finalized

import { BigNumber } from '@ethersproject/bignumber'
import {
  Account,
  AccountVerification,
  Asset,
  AssetHistory,
  AssetHistoryAction,
  Auction,
  Collection,
  Currency,
  Maybe,
  Offer,
  OfferOpenBuy,
  OfferOpenSale,
  OfferOpenSaleSumAggregates,
  Ownership,
  OwnershipSumAggregates,
  Trade,
} from './graphql'

export const convertAsset = (
  asset: Pick<
    Asset,
    'id' | 'animationUrl' | 'image' | 'name' | 'unlockedContent'
  >,
): {
  id: string
  animationUrl: string | null | undefined
  image: string
  name: string
  unlockedContent: { url: string; mimetype: string | null } | null
} => ({
  id: asset.id,
  animationUrl: asset.animationUrl,
  image: asset.image,
  name: asset.name,
  unlockedContent: asset.unlockedContent,
})

export const convertAssetWithSupplies = (
  asset: Parameters<typeof convertAsset>[0] & {
    ownerships: {
      aggregates: Maybe<{
        sum: Maybe<Pick<OwnershipSumAggregates, 'quantity'>>
      }>
    }
    owned: {
      aggregates: Maybe<{
        sum: Maybe<Pick<OwnershipSumAggregates, 'quantity'>>
      }>
    }
    sales: {
      aggregates: Maybe<{
        sum: Maybe<Pick<OfferOpenSaleSumAggregates, 'availableQuantity'>>
      }>
    }
    collection: Pick<Collection, 'standard'>
  },
): ReturnType<typeof convertAsset> & {
  saleSupply: BigNumber
  totalSupply: BigNumber
  owned: BigNumber
  collection: Pick<Collection, 'standard'>
} => ({
  id: asset.id,
  animationUrl: asset.animationUrl,
  image: asset.image,
  unlockedContent: asset.unlockedContent,
  name: asset.name,
  saleSupply: BigNumber.from(
    asset.sales.aggregates?.sum?.availableQuantity || 0,
  ),
  collection: { standard: asset.collection.standard },
  totalSupply: BigNumber.from(
    asset.ownerships.aggregates?.sum?.quantity || '0',
  ),
  owned: BigNumber.from(asset.owned.aggregates?.sum?.quantity || '0'),
})

export const convertUser = (
  user: Maybe<
    Pick<Account, 'address' | 'image' | 'name'> & {
      verification: Maybe<Pick<AccountVerification, 'status'>>
    }
  >,
  defaultAddress: string,
): {
  address: string
  image: string | null
  name: string | null
  verified: boolean
} => ({
  address: user?.address || defaultAddress,
  image: user?.image || null,
  name: user?.name || null,
  verified: user?.verification?.status === 'VALIDATED',
})

export const convertFullUser = (
  user: Maybe<
    Pick<
      Account,
      | 'address'
      | 'image'
      | 'name'
      | 'description'
      | 'cover'
      | 'instagram'
      | 'twitter'
      | 'website'
    > & {
      verification: Maybe<Pick<AccountVerification, 'status'>>
    }
  >,
  defaultAddress: string,
): ReturnType<typeof convertUser> & {
  description: string | null
  cover: string | null
  instagram: string | null
  twitter: string | null
  website: string | null
} => ({
  ...convertUser(user, defaultAddress),
  description: user?.description || null,
  cover: user?.cover || null,
  instagram: user?.instagram || null,
  twitter: user?.twitter || null,
  website: user?.website || null,
})

export const convertOwnership = (
  ownership: Pick<Ownership, 'ownerAddress' | 'quantity'> & {
    owner:
      | (Pick<Account, 'address' | 'image' | 'name'> & {
          verification: Maybe<Pick<AccountVerification, 'status'>>
        })
      | null
  },
): Required<ReturnType<typeof convertUser>> & {
  quantity: string
} => ({
  ...convertUser(ownership.owner, ownership.ownerAddress),
  quantity: ownership.quantity,
})

export const convertHistories = (
  history: Pick<
    AssetHistory,
    | 'action'
    | 'date'
    | 'unitPrice'
    | 'quantity'
    | 'fromAddress'
    | 'toAddress'
    | 'transactionHash'
  > & {
    from:
      | (Pick<Account, 'image' | 'name'> & {
          verification: Maybe<Pick<AccountVerification, 'status'>>
        })
      | null
    to:
      | (Pick<Account, 'image' | 'name'> & {
          verification: Maybe<Pick<AccountVerification, 'status'>>
        })
      | null
    currency: Maybe<Pick<Currency, 'decimals' | 'symbol'>>
  },
): {
  action: AssetHistoryAction
  date: Date
  unitPrice: BigNumber | null
  quantity: BigNumber
  transactionHash: string | null
  fromAddress: string
  from: {
    name: string | null
    image: string | null
    verified: boolean
  } | null
  toAddress: string | null
  to: {
    name: string | null
    image: string | null
    verified: boolean
  } | null
  currency: {
    decimals: number
    symbol: string
  } | null
} => {
  return {
    action: history.action,
    date: new Date(history.date),
    unitPrice: (history.unitPrice && BigNumber.from(history.unitPrice)) || null,
    quantity: BigNumber.from(history.quantity),
    fromAddress: history.fromAddress,
    transactionHash: history.transactionHash,
    from: history.from
      ? {
          image: history.from.image,
          name: history.from.name,
          verified: history.from.verification?.status === 'VALIDATED',
        }
      : null,
    toAddress: history.toAddress,
    to: history.to
      ? {
          image: history.to.image,
          name: history.to.name,
          verified: history.to.verification?.status === 'VALIDATED',
        }
      : null,
    currency: history.currency,
  }
}

export const convertAuctionWithBestBid = (
  auction: Pick<Auction, 'endAt'> & {
    bestBid: Maybe<{
      nodes: Array<
        Pick<Offer, 'unitPrice' | 'amount'> & {
          currency: Pick<Currency, 'decimals' | 'symbol'>
        }
      >
    }>
  },
): {
  endAt: Date
  bestBid:
    | {
        unitPrice: BigNumber
        amount: BigNumber
        currency: {
          decimals: number
          symbol: string
        }
      }
    | undefined
} => {
  const bestBid = auction.bestBid?.nodes[0]
  if (!bestBid)
    return {
      endAt: new Date(auction.endAt),
      bestBid: undefined,
    }
  return {
    endAt: new Date(auction.endAt),
    bestBid: {
      amount: BigNumber.from(bestBid.amount),
      unitPrice: BigNumber.from(bestBid.unitPrice),
      currency: bestBid.currency,
    },
  }
}

export const convertAuctionFull = (
  auction: Pick<Auction, 'id' | 'reserveAmount' | 'endAt' | 'expireAt'> & {
    winningOffer: { id: string } | null | undefined
    currency: Pick<Currency, 'decimals' | 'symbol' | 'image'>
  },
): {
  id: string
  reserveAmount: BigNumber
  endAt: Date
  expireAt: Date
  currency: {
    decimals: number
    symbol: string
    image: string
  }
  winningOffer: { id: string } | null | undefined
} => {
  return {
    id: auction.id,
    reserveAmount: BigNumber.from(auction.reserveAmount),
    endAt: new Date(auction.endAt),
    expireAt: new Date(auction.expireAt),
    currency: auction.currency,
    winningOffer: auction.winningOffer,
  }
}

export const convertSale = (
  sale:
    | (Pick<OfferOpenSale, 'unitPrice'> & {
        currency: Pick<Currency, 'decimals' | 'symbol' | 'id' | 'image'>
      })
    | undefined,
):
  | undefined
  | {
      unitPrice: BigNumber
      currency: {
        id: string
        decimals: number
        symbol: string
        image: string
      }
    } => {
  if (!sale) return
  return {
    unitPrice: BigNumber.from(sale.unitPrice),
    currency: sale.currency,
  }
}

export const convertSaleFull = (
  sale: Parameters<typeof convertSale>[0] &
    Pick<OfferOpenSale, 'id' | 'expiredAt' | 'availableQuantity'> & {
      maker: Pick<Account, 'address' | 'name' | 'image'> & {
        verification: Maybe<Pick<AccountVerification, 'status'>>
      }
    },
): Required<ReturnType<typeof convertSale>> & {
  id: string
  maker: {
    address: string
    name: string | null | undefined
    image: string | null | undefined
    verified: boolean
  }
  expiredAt: Date | undefined
  availableQuantity: BigNumber
} => {
  const base = convertSale(sale)
  if (!base) throw new Error('invalid sale')
  return {
    ...base,
    id: sale.id,
    maker: {
      address: sale.maker.address,
      name: sale.maker.name,
      image: sale.maker.image,
      verified: sale.maker.verification?.status === 'VALIDATED',
    },
    expiredAt: sale.expiredAt ? new Date(sale.expiredAt) : undefined,
    availableQuantity: BigNumber.from(sale.availableQuantity),
  }
}

export const convertBid = (
  bid: Pick<OfferOpenBuy, 'unitPrice' | 'amount'> & {
    currency: Pick<Currency, 'decimals' | 'symbol' | 'id' | 'image'>
    maker: Pick<Account, 'address' | 'name' | 'image'> & {
      verification: Maybe<Pick<AccountVerification, 'status'>>
    }
  },
): {
  maker: {
    address: string
    name: string | null | undefined
    image: string | null | undefined
    verified: boolean
  }
  amount: BigNumber
  unitPrice: BigNumber
  currency: {
    id: string
    decimals: number
    symbol: string
    image: string
  }
} => {
  return {
    amount: BigNumber.from(bid.amount),
    maker: {
      address: bid.maker.address,
      image: bid.maker.image,
      name: bid.maker.name,
      verified: bid.maker.verification?.status === 'VALIDATED',
    },
    unitPrice: BigNumber.from(bid.unitPrice),
    currency: bid.currency,
  }
}

export const convertBidFull = (
  bid: Parameters<typeof convertBid>[0] &
    Pick<OfferOpenBuy, 'id' | 'availableQuantity' | 'expiredAt' | 'createdAt'>,
): Required<ReturnType<typeof convertBid>> & {
  id: string
  availableQuantity: BigNumber
  expiredAt: Date | undefined
  createdAt: Date
} => {
  return {
    ...convertBid(bid),
    id: bid.id,
    availableQuantity: BigNumber.from(bid.availableQuantity),
    expiredAt: bid.expiredAt ? new Date(bid.expiredAt) : undefined,
    createdAt: new Date(bid.createdAt),
  }
}

export const convertTrade = (
  trade: Pick<
    Trade,
    | 'timestamp'
    | 'transactionHash'
    | 'amount'
    | 'quantity'
    | 'buyerAddress'
    | 'sellerAddress'
  > & {
    currency: Maybe<
      Pick<Currency, 'id' | 'image' | 'name' | 'decimals' | 'symbol'>
    >
    asset: Maybe<Pick<Asset, 'name' | 'image'>>
  },
): {
  transactionHash: string
  amount: BigNumber
  quantity: BigNumber
  buyerAddress: string
  sellerAddress: string
  createdAt: Date
  currency: {
    name: string
    id: string
    image: string
    decimals: number
    symbol: string
  } | null
  asset?: {
    name: string
    image: string
  }
} => {
  return {
    transactionHash: trade.transactionHash,
    amount: BigNumber.from(trade.amount),
    buyerAddress: trade.buyerAddress,
    createdAt: new Date(trade.timestamp),
    quantity: BigNumber.from(trade.quantity),
    sellerAddress: trade.sellerAddress,
    currency: trade.currency,
    asset: trade.asset
      ? {
          name: trade.asset.name,
          image: trade.asset.image,
        }
      : undefined,
  }
}
