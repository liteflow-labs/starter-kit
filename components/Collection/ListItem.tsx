import { Text, VStack } from '@chakra-ui/react'
import Image from 'next/image'
import numbro from 'numbro'
import { FC } from 'react'
import { ListItem, ListItemProps } from '../List/List'

type Props = Omit<
  ListItemProps,
  'label' | 'subtitle' | 'action' | 'image' | 'imageRounded'
> & {
  collection: {
    chainId: number
    address: string
    name: string
    image: string | null
    totalVolume: string
    totalVolumeCurrencySymbol: string
    floorPrice: string | null
    floorPriceCurrencySymbol: string | null
  }
}

const CollectionListItem: FC<Props> = ({ collection, ...props }) => {
  return (
    <ListItem
      key={`${collection.chainId}-${collection.address}`}
      label={
        <Text variant="subtitle2" color="gray.800">
          {collection.name}
        </Text>
      }
      subtitle={
        collection.floorPrice
          ? `Floor: ${numbro(collection.floorPrice).format({
              thousandSeparated: true,
              trimMantissa: true,
              mantissa: 2,
            })} ${collection.floorPriceCurrencySymbol}`
          : 'Floor: -'
      }
      action={
        <VStack textAlign="right" alignItems="end" spacing="0.5">
          <Text
            variant="subtitle2"
            noOfLines={1}
            wordBreak="break-all"
          >{`${numbro(collection.totalVolume).format({
            thousandSeparated: true,
            trimMantissa: true,
            mantissa: 2,
          })} ${collection.totalVolumeCurrencySymbol}`}</Text>
          <Text variant="caption" color="gray.500">
            All time
          </Text>
        </VStack>
      }
      image={
        collection.image ? (
          <Image
            src={collection.image}
            alt={collection.name}
            width={32}
            height={32}
          />
        ) : (
          <span />
        )
      }
      imageRounded="sm"
      {...props}
    />
  )
}

export default CollectionListItem
