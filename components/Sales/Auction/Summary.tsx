import { useAuctionStatus } from '@liteflow/react'
import { FC } from 'react'
import SaleAuctionIncompleteNoBids from './Incomplete/FailedNoBids'
import SaleAuctionIncompleteReservePrice from './Incomplete/FailedReservePrice'
import SaleAuctionIncompleteSuccess from './Incomplete/Successfully'
import SaleAuctionInProgress from './Inprogress/Inprogress'

export type Props = {
  auction: {
    endAt: Date
    expireAt: Date
    reserveAmount: string
    currency: {
      decimals: number
      image: string
      symbol: string
    }
    winningOffer: { id: string } | null | undefined
  }
  bestAuctionBid:
    | {
        amount: string
        unitPrice: string
        currency: {
          decimals: number
          symbol: string
          image: string
        }
        maker: {
          address: string
          image: string | null
          name: string | null
        }
      }
    | undefined
  isOwner: boolean
}

const SaleAuctionSummary: FC<Props> = ({
  auction,
  bestAuctionBid,
  isOwner,
}) => {
  const {
    inProgress,
    endedAndWaitingForTransfer,
    hasBids,
    bellowReservePrice,
    reservePriceMatches,
  } = useAuctionStatus(auction, bestAuctionBid)

  if (inProgress)
    return (
      <SaleAuctionInProgress
        auction={auction}
        bestAuctionBid={bestAuctionBid}
      />
    )
  if (endedAndWaitingForTransfer && !hasBids)
    return <SaleAuctionIncompleteNoBids mb={isOwner ? -5 : 0} />
  if (endedAndWaitingForTransfer && bellowReservePrice) {
    if (!bestAuctionBid) throw new Error('bestAuctionBid is falsy')
    return (
      <SaleAuctionIncompleteReservePrice
        bestAuctionBid={bestAuctionBid}
        mb={isOwner ? -5 : 0}
      />
    )
  }
  if (endedAndWaitingForTransfer && reservePriceMatches) {
    if (!bestAuctionBid) throw new Error('bestAuctionBid is falsy')
    return (
      <SaleAuctionIncompleteSuccess
        auction={auction}
        isOwner={isOwner}
        bestAuctionBid={bestAuctionBid}
      />
    )
  }
  return null
}

export default SaleAuctionSummary
