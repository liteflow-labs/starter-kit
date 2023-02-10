import { Box, Flex, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import Image from 'components/Image/Image'
import Link from 'components/Link/Link'
import { convertCollection } from 'convert'
import numbro from 'numbro'
import { FC } from 'react'

type Props = {
  collection: ReturnType<typeof convertCollection>
}

const CollectionCard: FC<Props> = ({ collection }) => {
  const convertTitle = (value: string | null, symbol: string | null) =>
    `${value ? value : '-'} ${symbol ? symbol : ''}`
  const convertValue = (value: string | null, symbol: string | null) => {
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
      border="1px"
      borderColor="gray.200"
      borderRadius="2xl"
      overflow="hidden"
      w="full"
    >
      <Flex position="relative" h={120} w="full" bg="gray.100">
        {collection.cover && (
          <Image
            src={collection.cover}
            alt={collection.name}
            layout="fill"
            objectFit="cover"
            sizes="
            (min-width: 80em) 292px,
            (min-width: 62em) 25vw,
            (min-width: 48em) 33vw,
            (min-width: 30em) 50vw,
            100vw"
          />
        )}
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
              width={52}
              height={52}
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
            <Text variant="subtitle2" color="gray.500">
              Total Vol.
            </Text>
            <Text
              variant="subtitle2"
              isTruncated
              title={convertTitle(
                collection.totalVolume,
                collection.totalVolumeCurrencySymbol,
              )}
            >
              {convertValue(
                collection.totalVolume,
                collection.totalVolumeCurrencySymbol,
              )}
            </Text>
          </Box>
          <Box>
            <Text variant="subtitle2" color="gray.500">
              Floor price
            </Text>
            <Text
              variant="subtitle2"
              isTruncated
              title={convertTitle(
                collection.floorPrice,
                collection.floorPriceCurrencySymbol,
              )}
            >
              {convertValue(
                collection.floorPrice,
                collection.floorPriceCurrencySymbol,
              )}
            </Text>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}

export default CollectionCard
