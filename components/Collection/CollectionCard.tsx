import {
  AspectRatio,
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import Image from 'components/Image/Image'
import Link from 'components/Link/Link'
import useTranslation from 'next-translate/useTranslation'
import numbro from 'numbro'
import { FC } from 'react'

export type Props = {
  collection: {
    chainId: number
    address: string
    name: string
    image: string | null
    cover: string | null
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

const CollectionCard: FC<Props> = ({ collection }) => {
  const { t } = useTranslation('templates')
  const convertTitle = (
    value: string | undefined,
    symbol: string | undefined,
  ) => `${value ? value : '-'} ${symbol ? symbol : ''}`
  const convertValue = (
    value: string | undefined,
    symbol: string | undefined,
  ) => {
    const formattedValue = value
      ? numbro(value).format({
          thousandSeparated: true,
          trimMantissa: true,
          mantissa: 4,
        })
      : '-'
    return `${value ? formattedValue : '-'} ${symbol ? symbol : ''}`
  }
  return (
    <Box
      as={Link}
      href={`/collection/${collection.chainId}/${collection.address}`}
      bg="white"
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.200"
      shadow="sm"
      overflow="hidden"
      w="full"
    >
      <Flex w="full" position="relative" bg="gray.100">
        <AspectRatio w="full" ratio={7 / 4}>
          {collection.cover ? (
            <Image
              src={collection.cover}
              alt={collection.name}
              fill
              sizes="
            (min-width: 80em) 292px,
            (min-width: 62em) 25vw,
            (min-width: 48em) 33vw,
            (min-width: 30em) 50vw,
            100vw"
              objectFit="cover"
            />
          ) : (
            <Box />
          )}
        </AspectRatio>
        <Box
          position="absolute"
          bottom="-28px"
          left={4}
          w={14}
          h={14}
          rounded="2xl"
          overflow="hidden"
          border="2px solid"
          borderColor="white"
          bg="gray.200"
        >
          {collection.image && (
            <Image
              src={collection.image}
              alt={collection.name}
              fill
              sizes="52px"
              objectFit="cover"
            />
          )}
        </Box>
      </Flex>

      <VStack alignItems="flex-start" w="full" spacing={2} mt={5} p={4}>
        <Heading
          as="h6"
          variant="heading3"
          title={collection.name}
          isTruncated
          w="full"
        >
          {collection.name}
        </Heading>
        <SimpleGrid columns={2} spacing={3} w="full">
          <Box>
            <Text
              variant="subtitle2"
              color="gray.500"
              title={t('collection.card.total-volume')}
              isTruncated
            >
              {t('collection.card.total-volume')}
            </Text>
            <Text
              variant="subtitle2"
              isTruncated
              title={convertTitle(
                collection.totalVolume.valueInRef,
                collection.totalVolume.refCode,
              )}
            >
              {convertValue(
                collection.totalVolume.valueInRef,
                collection.totalVolume.refCode,
              )}
            </Text>
          </Box>
          <Box>
            <Text
              variant="subtitle2"
              color="gray.500"
              title={t('collection.card.floor-price')}
              isTruncated
            >
              {t('collection.card.floor-price')}
            </Text>
            <Text
              variant="subtitle2"
              isTruncated
              title={convertTitle(
                collection.floorPrice?.valueInRef,
                collection.floorPrice?.refCode,
              )}
            >
              {convertValue(
                collection.floorPrice?.valueInRef,
                collection.floorPrice?.refCode,
              )}
            </Text>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

export default CollectionCard
