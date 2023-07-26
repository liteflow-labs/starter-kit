import { Stack } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { BigNumberish } from '@ethersproject/bignumber'
import { useAuctionStatus } from '@liteflow/react'
import { FC } from 'react'
import { BlockExplorer } from '../../hooks/useBlockExplorer'
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
  blockExplorer: BlockExplorer
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
  bestBid:
    | (SaleAuctionSummaryProps['bestBid'] & {
        amount: BigNumberish
      })
    | undefined

  isHomepage: boolean

  // Owner related props
  signer: Signer | undefined
  currentAccount: string | null | undefined
  isOwner: boolean
  ownAllSupply: boolean

  // Callbacks
  onOfferCanceled: (id: string) => Promise<void>
  onAuctionAccepted: (id: string) => Promise<void>
}

const SaleDetail: FC<Props> = ({
  assetId,
  chainId,
  blockExplorer,
  currencies,
  directSales,
  auction,
  bestBid,
  isHomepage,
  signer,
  currentAccount,
  isSingle,
  isOwner,
  ownAllSupply,
  onOfferCanceled,
  onAuctionAccepted,
}) => {
  const {
    inProgress,
    ended,
    endedAndWaitingForTransfer,
    hasBids,
    bellowReservePrice,
    reservePriceMatches,
    isValid,
  } = useAuctionStatus(auction, bestBid)

  return (
    <Stack spacing={8}>
      {directSales && directSales.length > 0 ? (
        <>
          <SaleDirectSummary sales={directSales} isSingle={isSingle} />
          <SaleDirectButton
            assetId={assetId}
            chainId={chainId}
            sales={directSales}
            blockExplorer={blockExplorer}
            isHomepage={isHomepage}
            signer={signer}
            currentAccount={currentAccount}
            ownAllSupply={ownAllSupply}
            onOfferCanceled={onOfferCanceled}
          />
          <SaleDirectInfo
            assetId={assetId}
            chainId={chainId}
            blockExplorer={blockExplorer}
            signer={signer}
            currentAccount={currentAccount}
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
            bestBid={bestBid}
            isOwner={isOwner}
            inProgress={inProgress}
            endedWithNoBids={endedAndWaitingForTransfer && !hasBids}
            endedWithNoReserve={
              endedAndWaitingForTransfer && bellowReservePrice
            }
            endedWithReserve={endedAndWaitingForTransfer && reservePriceMatches}
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
            signer={signer}
            isOwner={isOwner}
            isHomepage={isHomepage}
            inProgress={inProgress}
            endedWithNoBids={endedAndWaitingForTransfer && !hasBids}
            endedWithNoReserve={
              endedAndWaitingForTransfer && bellowReservePrice
            }
            endedWithReserve={endedAndWaitingForTransfer && reservePriceMatches}
            blockExplorer={blockExplorer}
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
