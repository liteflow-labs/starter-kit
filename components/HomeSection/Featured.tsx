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
import { useFetchFeaturedAssetsQuery } from '../../graphql'
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
  const featureAssetsQuery = useFetchFeaturedAssetsQuery({
    variables: {
      featuredIds: FEATURED_TOKEN,
      now: date,
      address: address || '',
    },
    skip: !FEATURED_TOKEN.length,
  })
  useHandleQueryError(featureAssetsQuery)

  const currencies = featureAssetsQuery.data?.currencies?.nodes

  const featured = useOrderByKey(
    FEATURED_TOKEN,
    featureAssetsQuery.data?.assets?.nodes,
    (asset) => asset.id,
  )

  const reloadInfo = useCallback(async () => {
    void featureAssetsQuery.refetch()
  }, [featureAssetsQuery])

  const featuredAssets = useMemo(
    () =>
      featured && currencies
        ? featured.map((asset) => (
            <TokenHeader
              key={asset.id}
              asset={asset}
              currencies={currencies}
              isHomepage={true}
              onOfferCanceled={reloadInfo}
            />
          ))
        : undefined,
    [featured, reloadInfo, currencies],
  )

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
