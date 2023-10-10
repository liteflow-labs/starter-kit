// Temporary file to centralize all the conversions.
// This file will be removed when the whole migration of the components is finalized

import { BigNumber } from '@ethersproject/bignumber'
import invariant from 'ts-invariant'
import {
  Account,
  AccountVerification,
  AssetTrait,
  Collection,
  CollectionStats,
  CollectionTraitValue,
  Currency,
  Drop,
  Maybe,
} from './graphql'

export type FileDef = {
  url: string
  mimetype: string | null
}

export const convertDropActive = (
  collectionWithDrops: Pick<
    Collection,
    'address' | 'chainId' | 'name' | 'image' | 'cover'
  > & {
    deployer: Pick<Account, 'address' | 'name' | 'username'> & {
      verification: Maybe<Pick<AccountVerification, 'status'>>
    }
  } & {
    drops: NonNullable<{
      nodes: Array<
        Pick<Drop, 'id' | 'startDate' | 'endDate' | 'unitPrice' | 'supply'> & {
          currency: {
            id: string
            decimals: number
            symbol: string
            image: string
          }
        }
      >
    }>
  },
): {
  id: string
  startDate: Date
  endDate: Date
  unitPrice: string
  supply: BigNumber | null
  collection: {
    address: string
    chainId: number
    cover: string | null
    image: string | null
    name: string
    deployer: {
      address: string
      name: string | null
      username: string | null
      verified: boolean
    }
  }
  currency: {
    id: string
    decimals: number
    symbol: string
    image: string
  }
} => {
  const totalSupply = collectionWithDrops.drops.nodes.some((x) => !x.supply)
    ? null
    : collectionWithDrops.drops.nodes.reduce(
        (acc, drop) => acc.add(BigNumber.from(drop.supply)),
        BigNumber.from(0),
      )

  const latestDrop = collectionWithDrops.drops.nodes[0]
  invariant(latestDrop, 'drop is required')

  return {
    ...latestDrop,
    supply: totalSupply,
    collection: {
      ...collectionWithDrops,
      deployer: {
        ...collectionWithDrops.deployer,
        verified:
          collectionWithDrops.deployer.verification?.status === 'VALIDATED',
      },
    },
    currency: latestDrop.currency,
  }
}

export const convertDropEnded = (
  collectionWithDrops: Pick<
    Collection,
    'address' | 'chainId' | 'name' | 'image' | 'cover'
  > & {
    deployer: Pick<Account, 'address' | 'name' | 'username'> & {
      verification: Maybe<Pick<AccountVerification, 'status'>>
    }
  } & {
    allDrops: NonNullable<{ nodes: Array<Pick<Drop, 'supply'>> }>
  } & {
    lastDrop: NonNullable<{
      nodes: Array<
        Pick<Drop, 'id' | 'startDate' | 'endDate' | 'unitPrice'> & {
          currency: {
            id: string
            decimals: number
            symbol: string
            image: string
          }
        }
      >
    }>
  },
): {
  id: string
  startDate: Date
  endDate: Date
  unitPrice: string
  supply: BigNumber | null
  collection: {
    address: string
    chainId: number
    cover: string | null
    image: string | null
    name: string
    deployer: {
      address: string
      name: string | null
      username: string | null
      verified: boolean
    }
  }
  currency: {
    id: string
    decimals: number
    symbol: string
    image: string
  }
} => {
  const totalSupply = collectionWithDrops.allDrops.nodes.some((x) => !x.supply)
    ? null
    : collectionWithDrops.allDrops.nodes.reduce(
        (acc, drop) => acc.add(BigNumber.from(drop.supply)),
        BigNumber.from(0),
      )

  const latestDrop = collectionWithDrops.lastDrop.nodes[0]
  invariant(latestDrop, 'lastDrop is required')
  return {
    ...latestDrop,
    supply: totalSupply,
    collection: {
      ...collectionWithDrops,
      deployer: {
        ...collectionWithDrops.deployer,
        verified:
          collectionWithDrops.deployer.verification?.status === 'VALIDATED',
      },
    },
    currency: latestDrop.currency,
  }
}

export const convertCollection = (
  collection: Pick<
    Collection,
    'address' | 'name' | 'image' | 'cover' | 'chainId'
  > & {
    floorPrice: Maybe<Pick<CollectionStats, 'valueInRef' | 'refCode'>>
  } & {
    totalVolume: Pick<CollectionStats, 'valueInRef' | 'refCode'>
  },
): {
  chainId: number
  address: string
  name: string
  image: string | null
  cover: string | null
  totalVolume: string
  totalVolumeCurrencySymbol: string
  floorPrice: string | null
  floorPriceCurrencySymbol: string | null
} => {
  return {
    chainId: collection.chainId,
    address: collection.address,
    name: collection.name,
    image: collection.image,
    cover: collection.cover,
    totalVolume: collection.totalVolume?.valueInRef,
    totalVolumeCurrencySymbol: collection.totalVolume?.refCode,
    floorPrice: collection.floorPrice?.valueInRef || null,
    floorPriceCurrencySymbol: collection.floorPrice?.refCode || null,
  }
}

export const convertTraits = (asset: {
  traits: {
    nodes: Array<
      Pick<AssetTrait, 'type' | 'value'> & {
        collectionTraitValue: Maybe<
          Pick<CollectionTraitValue, 'numberOfAssets'>
        >
      }
    >
  }
  collection: {
    supply: number
  }
}): {
  type: string
  value: string
  percent: number
}[] => {
  const assetTraitsWithCounts = asset.traits.nodes.map((assetTrait) => {
    return {
      type: assetTrait.type,
      value: assetTrait.value,
      percent:
        ((assetTrait.collectionTraitValue?.numberOfAssets || 0) /
          asset.collection.supply) *
        100,
    }
  })

  return assetTraitsWithCounts
}

export const convertCollectionFull = (
  collection: Pick<
    Collection,
    | 'address'
    | 'chainId'
    | 'name'
    | 'description'
    | 'image'
    | 'cover'
    | 'twitter'
    | 'discord'
    | 'website'
  > & {
    deployer: Pick<Account, 'address' | 'name' | 'username'> & {
      verification: Maybe<Pick<AccountVerification, 'status'>>
    }
  },
): {
  address: string
  chainId: number
  name: string
  description: string | null
  image: string | null
  cover: string | null
  twitter: string | null
  discord: string | null
  website: string | null
  deployer: {
    address: string
    name: string | null
    username: string | null
    verified: boolean
  }
} => {
  return {
    address: collection.address,
    chainId: collection.chainId,
    name: collection.name,
    description: collection.description,
    image: collection.image,
    cover: collection.cover,
    twitter: collection.twitter,
    discord: collection.discord,
    website: collection.website,
    deployer: {
      address: collection.deployer.address,
      name: collection.deployer.name,
      username: collection.deployer.username,
      verified: collection.deployer?.verification?.status === 'VALIDATED',
    },
  }
}

export const convertCollectionMetrics = (
  collection: Pick<Collection, 'numberOfOwners' | 'supply'> & {
    floorPrice: Maybe<Pick<CollectionStats, 'valueInRef' | 'refCode'>>
  } & {
    totalVolume: Pick<CollectionStats, 'valueInRef' | 'refCode'>
  },
): {
  totalVolume: string
  totalVolumeCurrencySymbol: string
  floorPrice: string | null
  floorPriceCurrencySymbol: string | null
  totalOwners: number
  supply: number
} => {
  return {
    totalVolume: collection.totalVolume.valueInRef,
    totalVolumeCurrencySymbol: collection.totalVolume.refCode,
    floorPrice: collection.floorPrice?.valueInRef || null,
    floorPriceCurrencySymbol: collection.floorPrice?.refCode || null,
    totalOwners: collection.numberOfOwners,
    supply: collection.supply,
  }
}

export const convertDropDetail = (
  drop: Pick<
    Drop,
    | 'id'
    | 'name'
    | 'startDate'
    | 'endDate'
    | 'unitPrice'
    | 'minted'
    | 'supply'
    | 'maxQuantityPerWallet'
    | 'isAllowed'
    | 'maxQuantity'
  > & {
    currency: Pick<Currency, 'id' | 'image' | 'symbol' | 'decimals'>
  },
): {
  id: string
  name: string
  startDate: Date
  endDate: Date
  unitPrice: string
  minted: string
  supply: string | null
  maxQuantityPerWallet: string | null
  isAllowed: boolean
  maxQuantity: string | null
  currency: {
    id: string
    decimals: number
    symbol: string
    image: string
  }
} => {
  return {
    id: drop.id,
    name: drop.name,
    startDate: drop.startDate,
    endDate: drop.endDate,
    unitPrice: drop.unitPrice,
    minted: drop.minted,
    supply: drop.supply || null,
    maxQuantityPerWallet: drop.maxQuantityPerWallet || null,
    isAllowed: drop.isAllowed,
    maxQuantity: drop.maxQuantity || null,
    currency: {
      id: drop.currency.id,
      decimals: drop.currency.decimals,
      symbol: drop.currency.symbol,
      image: drop.currency.image,
    },
  }
}

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
