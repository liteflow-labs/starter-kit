import { FC } from 'react'

type Props = {
  collection: {
    address: string
    chainId: number
    name: string
    description: string | null
    image: string
    cover: string | null
    twitter: string | null
    discord: string | null
    website: string | null
    deployerAddress: string
    deployer: {
      address: string
      name: string | null
      username: string | null
      verified: boolean
    } | null
    totalVolume: string
    totalVolumeCurrencySymbol: string
    floorPrice: string
    floorPriceCurrencySymbol: string
    totalOwners: number
    supply: number
  }
}

const CollectionHeader: FC<Props> = ({ collection }) => {
  return <p>{collection.name}</p>
}

export default CollectionHeader
