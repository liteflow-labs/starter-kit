import {
  AspectRatio,
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Skeleton,
  Stack,
} from '@chakra-ui/react'
import { FC, useCallback } from 'react'
import { useFetchFeaturedTokenQuery } from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useCart from '../../hooks/useCart'
import useDetectAssetMedia from '../../hooks/useDetectAssetMedia'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import Link from '../Link/Link'
import SaleDetail from '../Sales/Detail'
import SkeletonProperty from '../Skeleton/Property'
import TokenMedia from '../Token/Media'
import TokenMetadata from '../Token/Metadata'

export type Props = {
  date: Date
  chainId: number
  collectionAddress: string
  tokenId: string
}

const FeaturedToken: FC<Props> = ({
  date,
  chainId,
  collectionAddress,
  tokenId,
}) => {
  const { address } = useAccount()

  const fetchFeaturedTokenQuery = useFetchFeaturedTokenQuery({
    variables: {
      chainId,
      collectionAddress,
      tokenId,
      now: date,
      address: address || '',
    },
  })
  useHandleQueryError(fetchFeaturedTokenQuery)
  const asset = fetchFeaturedTokenQuery.data?.asset
  const sales = fetchFeaturedTokenQuery.data?.sales?.nodes
  const currencies = fetchFeaturedTokenQuery.data?.currencies?.nodes
  const ownerships = fetchFeaturedTokenQuery.data?.ownerships

  const media = useDetectAssetMedia(asset)

  const refresh = useCallback(async () => {
    await fetchFeaturedTokenQuery.refetch({
      now: new Date(),
    })
  }, [fetchFeaturedTokenQuery])

  useCart({ onCheckout: fetchFeaturedTokenQuery.refetch })

  return (
    <SimpleGrid spacing={4} flex="0 0 100%" columns={{ base: 0, md: 2 }}>
      <Box my="auto" p={{ base: 6, md: 12 }} textAlign="center">
        <Flex
          as={Link}
          href={`/tokens/${asset?.chainId}-${asset?.collection.address}-${asset?.tokenId}`}
          condition={!!asset}
          mx="auto"
          maxH="sm"
          w="full"
          h="full"
          maxW="sm"
          align="center"
          justify="center"
          overflow="hidden"
          rounded="lg"
          shadow="md"
        >
          <AspectRatio w="full" ratio={1}>
            {!asset ? (
              <Skeleton width="100%" height="100%" />
            ) : (
              <TokenMedia
                {...media}
                defaultText={asset.name}
                fill
                sizes="
              (min-width: 30em) 384px,
              100vw"
              />
            )}
          </AspectRatio>
        </Flex>
      </Box>
      <Stack spacing={8} p={{ base: 6, md: 12 }}>
        <Stack spacing={1}>
          <Heading as="p" variant="heading1" color="gray.500">
            {!asset ? (
              <Skeleton height="1em" width="200px" />
            ) : (
              <Link
                href={`/collection/${asset.collection.chainId}/${asset.collection.address}`}
              >
                {asset.collection.name}
              </Link>
            )}
          </Heading>
          <Heading as="h1" variant="title" color="brand.black">
            {!asset ? <Skeleton height="1em" width="300px" /> : asset.name}
          </Heading>
        </Stack>

        {!asset || !sales || !ownerships ? (
          <SkeletonProperty items={3} />
        ) : (
          <TokenMetadata asset={asset} sales={sales} ownerships={ownerships} />
        )}

        {!asset || !sales || !currencies ? (
          <>
            <SkeletonProperty items={1} />
            <Skeleton height="40px" width="100%" />
          </>
        ) : (
          <SaleDetail
            asset={asset}
            sales={sales}
            currencies={currencies}
            isHomepage={true}
            onOfferCanceled={refresh}
          />
        )}
      </Stack>
    </SimpleGrid>
  )
}

export default FeaturedToken
