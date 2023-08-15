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
import {
  convertAssetWithSupplies,
  convertAuctionFull,
  convertBid,
  convertOwnership,
  convertSaleFull,
  convertUser,
} from '../../convert'
import environment from '../../environment'
import {
  useFetchCurrenciesForBidsQuery,
  useFetchFeaturedAssetsQuery,
} from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import { useOrderByKey } from '../../hooks/useOrderByKey'
import useSigner from '../../hooks/useSigner'
import Slider from '../Slider/Slider'
import TokenHeader from '../Token/Header'

type Props = {
  date: Date
}

const FeaturedHomeSection: FC<Props> = ({ date }) => {
  const signer = useSigner()
  const { address } = useAccount()
  const currenciesQuery = useFetchCurrenciesForBidsQuery()
  const featureAssetsQuery = useFetchFeaturedAssetsQuery({
    variables: {
      featuredIds: environment.FEATURED_TOKEN,
      now: date,
      address: address || '',
    },
  })
  useHandleQueryError(featureAssetsQuery)
  useHandleQueryError(currenciesQuery)

  const assetData = featureAssetsQuery.data

  const featured = useOrderByKey(
    environment.FEATURED_TOKEN,
    assetData?.assets?.nodes || [],
    (asset) => asset.id,
  )
  const currencyData = currenciesQuery.data

  const reloadInfo = useCallback(async () => {
    void featureAssetsQuery.refetch()
  }, [featureAssetsQuery])

  const featuredAssets = useMemo(
    () =>
      featured?.map((asset) => (
        <TokenHeader
          key={asset.id}
          asset={convertAssetWithSupplies(asset)}
          currencies={currencyData?.currencies?.nodes || []}
          auction={
            asset.auctions.nodes[0]
              ? convertAuctionFull(asset.auctions.nodes[0])
              : undefined
          }
          bestBid={
            asset.auctions.nodes[0]?.bestBid?.nodes[0]
              ? convertBid(asset.auctions.nodes[0]?.bestBid?.nodes[0])
              : undefined
          }
          sales={asset.sales.nodes.map(convertSaleFull)}
          creator={convertUser(asset.creator, asset.creator.address)}
          owners={asset.ownerships.nodes.map(convertOwnership)}
          numberOfOwners={asset.ownerships.totalCount}
          isHomepage={true}
          signer={signer}
          currentAccount={address}
          onOfferCanceled={reloadInfo}
          onAuctionAccepted={reloadInfo}
        />
      )),
    [featured, address, signer, reloadInfo, currencyData],
  )

  if (featureAssetsQuery.loading && !assetData)
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
  if (!featuredAssets || featuredAssets.length === 0) return null
  if (featuredAssets.length === 1) return <header>{featuredAssets}</header>
  return (
    <header>
      <Flex as={Slider}>{featuredAssets}</Flex>
    </header>
  )
}

export default FeaturedHomeSection
