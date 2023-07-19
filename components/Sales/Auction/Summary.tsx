import { BigNumber } from '@ethersproject/bignumber'
import { FC } from 'react'
import SaleAuctionIncompleteNoBids from './Incomplete/FailedNoBids'
import SaleAuctionIncompleteReservePrice from './Incomplete/FailedReservePrice'
import SaleAuctionIncompleteSuccess from './Incomplete/Successfully'
import SaleAuctionInProgress from './Inprogress/Inprogress'

export type Props = {
  auction: {
    endAt: Date
    expireAt: Date
    currency: {
      decimals: number
      image: string
      symbol: string
    }
  }
  bestBid:
    | {
        unitPrice: BigNumber
        currency: {
          decimals: number
          symbol: string
          image: string
        }
        maker: {
          address: string
          image: string | null | undefined
          name: string | null | undefined
        }
      }
    | undefined
  isOwner: boolean
  inProgress: boolean
  endedWithNoBids: boolean
  endedWithNoReserve: boolean
  endedWithReserve: boolean
}

const SaleAuctionSummary: FC<Props> = ({
  auction,
  bestBid,
  isOwner,
  inProgress,
  endedWithNoBids,
  endedWithNoReserve,
  endedWithReserve,
}) => {
  if (inProgress)
    return <SaleAuctionInProgress auction={auction} bestBid={bestBid} />
  if (endedWithNoBids) return <SaleAuctionIncompleteNoBids isOwner={isOwner} />
  if (endedWithNoReserve) {
    if (!bestBid) throw new Error('bestBid is falsy')
    return (
      <SaleAuctionIncompleteReservePrice isOwner={isOwner} bestBid={bestBid} />
    )
  }
  if (endedWithReserve) {
    if (!bestBid) throw new Error('bestBid is falsy')
    return (
      <SaleAuctionIncompleteSuccess
        auction={auction}
        isOwner={isOwner}
        bestBid={bestBid}
      />
    )
  }
  return null
}

export default SaleAuctionSummary
