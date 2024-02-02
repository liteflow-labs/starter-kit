import {
  Box,
  Flex,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Spacer,
  Stack,
} from '@chakra-ui/react'
import { FC, useCallback, useMemo } from 'react'
import invariant from 'ts-invariant'
import {
  AssetFilter,
  OfferOpenSaleFilter,
  useFetchFeaturedAssetsQuery,
} from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useEnvironment from '../../hooks/useEnvironment'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import { useOrderByKey } from '../../hooks/useOrderByKey'
import Slider from '../Slider/Slider'
import TokenHeader from '../Token/Header'

type Props = {
  date: Date
}

const FeaturedHomeSection: FC<Props> = ({ date }) => {
  const { FEATURED_TOKEN } = useEnvironment()
  const { address } = useAccount()
  const idFilters = {
    or: FEATURED_TOKEN.map((x) => x.split('-')).map(
      ([chainId, collectionAddress, tokenId]) => {
        invariant(
          chainId !== undefined &&
            collectionAddress !== undefined &&
            tokenId !== undefined,
          'invalid feature token',
        )
        return {
          collectionAddress: { equalTo: collectionAddress.toLowerCase() },
          chainId: { equalTo: parseInt(chainId, 10) },
          tokenId: { equalTo: tokenId },
        }
      },
    ),
  }
  const featureAssetsQuery = useFetchFeaturedAssetsQuery({
    variables: {
      assetFilter: idFilters as AssetFilter,
      salesFilter: idFilters as OfferOpenSaleFilter,
      now: date,
      address: address || '',
    },
    skip: !FEATURED_TOKEN.length,
  })
  useHandleQueryError(featureAssetsQuery)

  const currencies = featureAssetsQuery.data?.currencies?.nodes
  const sales = featureAssetsQuery.data?.sales?.nodes

  const featured = useOrderByKey(
    FEATURED_TOKEN,
    featureAssetsQuery.data?.assets?.nodes,
    (asset) => asset.id,
  )

  const reloadInfo = useCallback(async () => {
    void featureAssetsQuery.refetch()
  }, [featureAssetsQuery])

  const featuredAssets = useMemo(() => {
    if (!featured || !currencies || !sales) return undefined
    return featured.map((asset) => {
      const salesOfAsset = sales.filter(
        (sale) =>
          sale.chainId === asset.chainId &&
          sale.collectionAddress === asset.collectionAddress &&
          sale.tokenId === asset.tokenId,
      )
      return (
        <TokenHeader
          key={asset.id}
          asset={asset}
          sales={salesOfAsset}
          currencies={currencies}
          isHomepage={true}
          onOfferCanceled={reloadInfo}
        />
      )
    })
  }, [featured, currencies, sales, reloadInfo])

  if (!FEATURED_TOKEN.length) return null
  if (!featuredAssets)
    return (
      <SimpleGrid spacing={4} flex="0 0 100%" columns={{ base: 0, md: 2 }}>
        <Box my="auto" p={{ base: 6, md: 12 }} textAlign="center">
          <Skeleton width={384} height={384} borderRadius={'2xl'} />
        </Box>
        <Stack spacing={8} p={{ base: 6, md: 12 }}>
          <Stack spacing={1}>
            <Skeleton width={200} height={6} />
            <Skeleton width={400} height={8} />
          </Stack>
          <SkeletonText />
          <Spacer />
          <Skeleton width="100%" height={12} borderRadius={'2xl'} />
        </Stack>
      </SimpleGrid>
    )
  if (featuredAssets.length === 0) return null
  if (featuredAssets.length === 1) return <header>{featuredAssets}</header>
  return (
    <header>
      <Flex as={Slider}>{featuredAssets}</Flex>
    </header>
  )
}

export default FeaturedHomeSection
