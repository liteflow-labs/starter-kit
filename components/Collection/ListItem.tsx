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
    floorPrice: {
      valueInRef: string
      refCode: string
    } | null
    totalVolume: {
      valueInRef: string
      refCode: string
    }
  }
}

const CollectionListItem: FC<Props> = ({ collection, ...props }) => {
  const { t } = useTranslation('components')
  return (
    <ListItem
      key={`${collection.chainId}-${collection.address}`}
      label={
        <Text
          variant="subtitle2"
          color="gray.800"
          title={collection.name}
          as="span"
        >
          {collection.name}
        </Text>
      }
      subtitle={
        <Text
          variant="caption"
          as="span"
          title={
            collection.floorPrice
              ? `${collection.floorPrice.valueInRef} ${collection.floorPrice.refCode}`
              : '-'
          }
        >
          {t('collection.listItem.floor', {
            price: collection.floorPrice
              ? `${numbro(collection.floorPrice.valueInRef).format({
                  thousandSeparated: true,
                  trimMantissa: true,
                  mantissa: 2,
                })} ${collection.floorPrice.refCode}`
              : '-',
          })}
        </Text>
      }
      action={
        <VStack textAlign="right" alignItems="end" spacing="0">
          <HStack
            spacing={1}
            title={`${collection.totalVolume.valueInRef} ${collection.totalVolume.refCode}`}
          >
            <Text
              variant="subtitle2"
              noOfLines={1}
              wordBreak="break-word"
              maxW={16}
            >
              {numbro(collection.totalVolume.valueInRef).format({
                thousandSeparated: true,
                trimMantissa: true,
                mantissa: 2,
              })}
            </Text>
            <Text variant="subtitle2">{collection.totalVolume.refCode}</Text>
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
            w={8}
            h={8}
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
