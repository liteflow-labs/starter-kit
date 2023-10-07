import { Stack } from '@chakra-ui/react'
import { BigNumberish } from '@ethersproject/bignumber'
import { useAuctionStatus } from '@liteflow/react'
import { FC } from 'react'
import SaleAuctionButton from './Auction/Button'
import type { Props as SaleAuctionInfoProps } from './Auction/Info'
import SaleAuctionInfo from './Auction/Info'
import SaleAuctionSummary, {
  Props as SaleAuctionSummaryProps,
} from './Auction/Summary'
import type { Props as SaleDirectButtonProps } from './Direct/Button'
import SaleDirectButton from './Direct/Button'
import type { Props as SaleDirectInfoProps } from './Direct/Info'
import SaleDirectInfo from './Direct/Info'
import SaleDirectSummary from './Direct/Summary'
import SaleOpenButton from './Open/Button'
import SaleOpenInfo from './Open/Info'
import type { Props as SaleOpenSummaryProps } from './Open/Summary'
import SaleOpenSummary from './Open/Summary'

export type Props = {
  // Asset related props
  assetId: string
  chainId: number
  isSingle: boolean
  currencies: SaleOpenSummaryProps['currencies']

  // Sales related props
  directSales: (SaleDirectInfoProps['sales'][0] &
    SaleDirectButtonProps['sales'][0] & {
      currency: { id: string; image: string }
    })[]
  auction:
    | (SaleAuctionInfoProps['auction'] &
        SaleAuctionSummaryProps['auction'] & {
          winningOffer: { id: string } | null | undefined
        })
    | undefined
  bestAuctionBid:
    | (SaleAuctionSummaryProps['bestAuctionBid'] & {
        amount: BigNumberish
      })
    | undefined

  isHomepage: boolean

  // Owner related props
  isOwner: boolean
  ownAllSupply: boolean

  // Callbacks
  onOfferCanceled: (id: string) => Promise<void>
  onAuctionAccepted: (id: string) => Promise<void>
}

const SaleDetail: FC<Props> = ({
  assetId,
  chainId,
  currencies,
  directSales,
  auction,
  bestAuctionBid,
  isHomepage,
  isSingle,
  isOwner,
  ownAllSupply,
  onOfferCanceled,
  onAuctionAccepted,
}) => {
  const { ended, isValid } = useAuctionStatus(auction, bestAuctionBid)

  return (
    <Stack spacing={8}>
      {directSales && directSales.length > 0 ? (
        <>
          <SaleDirectSummary sales={directSales} isSingle={isSingle} />
          <SaleDirectButton
            assetId={assetId}
            chainId={chainId}
            sales={directSales}
            isHomepage={isHomepage}
            ownAllSupply={ownAllSupply}
            onOfferCanceled={onOfferCanceled}
          />
          <SaleDirectInfo
            assetId={assetId}
            chainId={chainId}
            isHomepage={isHomepage}
            isOwner={isOwner}
            sales={directSales}
            onOfferCanceled={onOfferCanceled}
          />
        </>
      ) : auction && isValid ? (
        <>
          <SaleAuctionSummary
            auction={auction}
            bestAuctionBid={bestAuctionBid}
            isOwner={isOwner}
          />
          <SaleAuctionButton
            assetId={assetId}
            isEnded={ended}
            isOwner={isOwner}
            isHomepage={isHomepage}
          />
          <SaleAuctionInfo
            assetId={assetId}
            chainId={chainId}
            auction={auction}
            bestAuctionBid={bestAuctionBid}
            isOwner={isOwner}
            isHomepage={isHomepage}
            onAuctionAccepted={onAuctionAccepted}
          />
        </>
      ) : (
        <>
          <SaleOpenSummary currencies={currencies} />
          <SaleOpenButton
            assetId={assetId}
            isHomepage={isHomepage}
            ownAllSupply={ownAllSupply}
          />
          <SaleOpenInfo
            assetId={assetId}
            isHomepage={isHomepage}
            isOwner={isOwner}
          />
        </>
      )}
    </Stack>
  )
}

export default SaleDetail
