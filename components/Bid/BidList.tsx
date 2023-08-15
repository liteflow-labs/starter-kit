import { Text } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import useTranslation from 'next-translate/useTranslation'
import { FC, Fragment, useMemo } from 'react'
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

const BidList: FC<Props> = ({
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
  const { data: assetBids } = useFetchAssetBidsQuery({
    variables: {
      chainId,
      collectionAddress,
      tokenId,
      now: now,
    },
    skip: !!auctionId,
  })
  const { data: auctionBids } = useFetchAuctionBidsQuery({
    variables: {
      auctionId: auctionId || '',
      now,
    },
    skip: !auctionId,
  })
  const blockExplorer = useBlockExplorer(chainId)

  const bids = useMemo(() => {
    const list = auctionId
      ? auctionBids?.auction?.offers.nodes
      : assetBids?.asset?.bids.nodes
    return list?.map(convertBidFull)
  }, [auctionId, auctionBids, assetBids])

  if (bids === undefined)
    return (
      <SkeletonList items={5}>
        <SkeletonListItem image subtitle caption />
      </SkeletonList>
    )
  if (bids.length === 0)
    return (
      <Text as="p" variant="text" color="gray.500">
        {t('bid.list.none')}
      </Text>
    )
  return (
    <List>
      {bids.map((bid, i) => (
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
      ))}
    </List>
  )
}

export default BidList
