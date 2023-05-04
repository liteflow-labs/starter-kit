import { Text } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import useTranslation from 'next-translate/useTranslation'
import { Fragment, useMemo, VFC } from 'react'
import { convertBidFull } from '../../convert'
import { useFetchAssetBidsQuery, useFetchAuctionBidsQuery } from '../../graphql'
import useBlockExplorer from '../../hooks/useBlockExplorer'
import List from '../List/List'
import SkeletonList from '../Skeleton/List'
import SkeletonListItem from '../Skeleton/ListItem'
import Bid from './Bid'

type Props = {
  now: Date
  chainId: number
  collectionAddress: string
  tokenId: string
  auctionId: string | undefined
  signer: Signer | undefined
  account: string | null | undefined
  isSingle: boolean
  preventAcceptation: boolean
  totalOwned: BigNumber
  onAccepted: (id: string) => Promise<void>
  onCanceled: (id: string) => Promise<void>
}

const BidList: VFC<Props> = ({
  now,
  chainId,
  collectionAddress,
  tokenId,
  auctionId,
  signer,
  account,
  isSingle,
  preventAcceptation,
  totalOwned,
  onAccepted,
  onCanceled,
}) => {
  const { t } = useTranslation('components')
  const bidResults = useFetchAssetBidsQuery({
    variables: {
      id: [chainId, collectionAddress, tokenId].join('-'),
      now: now,
    },
    skip: !!auctionId,
  })
  const auctionBidResult = useFetchAuctionBidsQuery({
    variables: {
      auctionId: auctionId || '',
      now,
    },
    skip: !auctionId,
  })
  const blockExplorer = useBlockExplorer(chainId)

  const result = useMemo(
    () => (auctionId ? auctionBidResult : bidResults),
    [auctionId, auctionBidResult, bidResults],
  )

  const bids = useMemo(() => {
    const list = auctionId
      ? auctionBidResult.data?.auction?.offers.nodes ||
        auctionBidResult.previousData?.auction?.offers.nodes ||
        []
      : bidResults.data?.asset?.bids.nodes ||
        bidResults.previousData?.asset?.bids.nodes ||
        []
    return list.map(convertBidFull)
  }, [auctionBidResult, auctionId, bidResults])

  return (
    <List>
      {result.loading ? (
        <SkeletonList items={5}>
          <SkeletonListItem image subtitle caption />
        </SkeletonList>
      ) : bids.length > 0 ? (
        bids.map((bid, i) => (
          <Fragment key={i}>
            {i > 0 && bids[i - 1]?.currency.id !== bid.currency.id && <hr />}
            <Bid
              bid={bid}
              chainId={chainId}
              signer={signer}
              account={account}
              preventAcceptation={preventAcceptation}
              blockExplorer={blockExplorer}
              onAccepted={onAccepted}
              onCanceled={onCanceled}
              isSingle={isSingle}
              totalOwned={totalOwned}
            />
          </Fragment>
        ))
      ) : (
        <Text as="p" variant="text" color="gray.500">
          {t('bid.list.none')}
        </Text>
      )}
    </List>
  )
}

export default BidList
