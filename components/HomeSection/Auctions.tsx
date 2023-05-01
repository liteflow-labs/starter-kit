import { Flex, Heading, Skeleton, Stack } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertUser,
} from '../../convert'
import { useFetchAuctionsQuery } from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import SkeletonGrid from '../Skeleton/Grid'
import SkeletonTokenCard from '../Skeleton/TokenCard'
import Slider from '../Slider/Slider'
import TokenCard from '../Token/Card'

type Props = {
  date: Date
}

const AuctionsHomeSection: FC<Props> = ({ date }) => {
  const { address } = useAccount()
  const { t } = useTranslation('templates')
  const auctionAssetsQuery = useFetchAuctionsQuery({
    variables: { now: date, address: address || '' },
  })
  useHandleQueryError(auctionAssetsQuery)
  const auctions = useMemo(
    () => auctionAssetsQuery.data?.auctions?.nodes || [],
    [auctionAssetsQuery.data],
  )
  if (auctionAssetsQuery.loading)
    return (
      <Stack spacing={6}>
        <Skeleton noOfLines={1} height={8} width={200} />
        <SkeletonGrid items={4}>
          <SkeletonTokenCard />
        </SkeletonGrid>
      </Stack>
    )
  if (auctions.length === 0) return null
  return (
    <Stack spacing={6}>
      <Heading as="h2" variant="subtitle" color="brand.black">
        {t('home.auctions')}
      </Heading>
      <Slider>
        {auctions.map((x, i) => (
          <Flex
            key={i}
            grow={0}
            shrink={0}
            basis={{
              base: '100%',
              sm: '50%',
              md: '33.33%',
              lg: '25%',
            }}
            p="10px"
            overflow="hidden"
          >
            <TokenCard
              asset={convertAsset(x.asset)}
              creator={convertUser(x.asset.creator, x.asset.creator.address)}
              auction={convertAuctionWithBestBid(x)}
              sale={undefined}
              numberOfSales={0}
              hasMultiCurrency={false}
            />
          </Flex>
        ))}
      </Slider>
    </Stack>
  )
}

export default AuctionsHomeSection
