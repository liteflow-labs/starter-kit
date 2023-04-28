import { Flex, Heading, Skeleton, Stack } from '@chakra-ui/react'
import { gql } from 'graphql-request'
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

gql`
  query FetchAuctions($now: Datetime!, $address: Address) {
    auctions(filter: { endAt: { greaterThan: $now } }, orderBy: END_AT_ASC) {
      nodes {
        id
        endAt
        bestBid: offers(
          orderBy: [UNIT_PRICE_IN_REF_DESC, CREATED_AT_ASC]
          first: 1
          filter: { signature: { isNull: false } }
        ) {
          nodes {
            unitPrice
            amount
            currency {
              image
              name
              id
              decimals
              symbol
            }
          }
        }
        asset {
          id
          name
          collection {
            chainId
            address
            name
          }
          owned: ownerships(filter: { ownerAddress: { equalTo: $address } }) {
            aggregates {
              sum {
                quantity
              }
            }
          }
          image
          animationUrl
          unlockedContent {
            url
            mimetype
          }
          creator {
            address
            name
            image
            verification {
              status
            }
          }
          bestBid: bids(
            orderBy: [UNIT_PRICE_IN_REF_DESC, CREATED_AT_ASC]
            filter: { expiredAt: { greaterThan: $now } }
            first: 1
          ) {
            nodes {
              unitPrice
              amount
              currency {
                image
                name
                id
                decimals
                symbol
              }
            }
          }
        }
      }
    }
  }
`

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
