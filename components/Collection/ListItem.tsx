import { HStack, Text, VStack } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import numbro from 'numbro'
import { FC } from 'react'
import Image from '../Image/Image'
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
  const { t } = useTranslation('components')
  return (
    <ListItem
      key={`${collection.chainId}-${collection.address}`}
      label={
        <Text variant="subtitle2" color="gray.800" title={collection.name}>
          {collection.name}
        </Text>
      }
      subtitle={
        <Text
          variant="caption"
          title={
            collection.floorPrice
              ? `${collection.floorPrice} ${collection.floorPriceCurrencySymbol}`
              : '-'
          }
        >
          {t('collection.listItem.floor', {
            price: collection.floorPrice
              ? `${numbro(collection.floorPrice).format({
                  thousandSeparated: true,
                  trimMantissa: true,
                  mantissa: 2,
                })} ${collection.floorPriceCurrencySymbol}`
              : '-',
          })}
        </Text>
      }
      action={
        <VStack textAlign="right" alignItems="end" spacing="0">
          <HStack
            spacing={1}
            title={`${collection.totalVolume} ${collection.totalVolumeCurrencySymbol}`}
          >
            <Text
              variant="subtitle2"
              noOfLines={1}
              wordBreak="break-word"
              maxW={16}
            >
              {numbro(collection.totalVolume).format({
                thousandSeparated: true,
                trimMantissa: true,
                mantissa: 2,
              })}
            </Text>
            <Text variant="subtitle2">
              {collection.totalVolumeCurrencySymbol}
            </Text>
          </HStack>
          <Text variant="caption" color="gray.500">
            {t('collection.listItem.allTime')}
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
            objectFit="cover"
          />
        ) : (
          <span />
        )
      }
      imageSize={8}
      imageRounded="sm"
      {...props}
    />
  )
}

export default CollectionListItem
