import { BigNumber } from '@ethersproject/bignumber'
import { useAuctionStatus } from '@liteflow/react'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'

export type Props = {
  auction: {
    endAt: string | Date
    expireAt: string | Date
    reserveAmount: BigNumber
    winningOffer: { id: string } | null | undefined
  }
  bestBid?: {
    amount: BigNumber
  }
}

const SaleAuctionStatus: FC<Props> = ({ auction, bestBid }) => {
  const { t } = useTranslation('components')
  const { inProgress } = useAuctionStatus(auction, bestBid)

  if (inProgress) return <span>{t('sales.auction.status.active')}</span>
  return <span>{t('sales.auction.status.ended')}</span>
}

export default SaleAuctionStatus
