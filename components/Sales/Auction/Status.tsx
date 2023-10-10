import { useAuctionStatus } from '@liteflow/react'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'

export type Props = {
  auction: {
    endAt: Date
    expireAt: Date
    reserveAmount: string
    winningOffer: { id: string } | null
  }
  bestBid:
    | {
        amount: string
      }
    | undefined
}

const SaleAuctionStatus: FC<Props> = ({ auction, bestBid }) => {
  const { t } = useTranslation('components')
  const { inProgress } = useAuctionStatus(auction, bestBid)

  if (inProgress) return <span>{t('sales.auction.status.active')}</span>
  return <span>{t('sales.auction.status.ended')}</span>
}

export default SaleAuctionStatus
