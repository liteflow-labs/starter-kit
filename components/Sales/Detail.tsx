import { Stack } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { useAuctionStatus } from '@liteflow/react'
import { FC, useMemo } from 'react'
import { AccountVerificationStatus, Standard } from '../../graphql'
import SaleAuctionButton from './Auction/Button'
import SaleAuctionInfo from './Auction/Info'
import SaleAuctionSummary from './Auction/Summary'
import SaleDirectButton from './Direct/Button'
import SaleDirectInfo from './Direct/Info'
import SaleDirectSummary from './Direct/Summary'
import SaleOpenButton from './Open/Button'
import SaleOpenInfo from './Open/Info'
import SaleOpenSummary from './Open/Summary'

export type Props = {
  asset: {
    id: string
    quantity: string
    collection: {
      chainId: number
      standard: Standard
    }
    owned: {
      quantity: string
    } | null
    sales: {
      nodes: {
        id: string
        unitPrice: string
        expiredAt: Date
        availableQuantity: string
        maker: {
          address: string
          image: string | null
          name: string | null
          verification: {
            status: AccountVerificationStatus
          } | null
        }
        currency: {
          id: string
          decimals: number
          image: string
          symbol: string
        }
      }[]
    }
    auctions: {
      nodes: {
        id: string
        endAt: Date
        expireAt: Date
        reserveAmount: string
        winningOffer:
          | {
              id: string
            }
          | null
          | undefined
        bestBid: {
          nodes: {
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
          }[]
        }
        currency: {
          decimals: number
          image: string
          symbol: string
        }
      }[]
    }
  }
  currencies: {
    chainId: number
    image: string
  }[]
  isHomepage: boolean

  // Callbacks
  onOfferCanceled: (id: string) => Promise<void>
  onAuctionAccepted: (id: string) => Promise<void>
}

const SaleDetail: FC<Props> = ({
  asset,
  currencies,
  isHomepage,
  onOfferCanceled,
  onAuctionAccepted,
}) => {
  const auction = asset.auctions.nodes[0]
  const bestAuctionBid = auction?.bestBid?.nodes[0]
  const { ended, isValid } = useAuctionStatus(auction, bestAuctionBid)

  const isOwner = useMemo(
    () => BigNumber.from(asset.owned?.quantity || 0).gt('0'),
    [asset.owned?.quantity],
  )
  const ownAllSupply = useMemo(
    () =>
      BigNumber.from(asset.owned?.quantity || 0).gte(
        BigNumber.from(asset.quantity || '0'),
      ),
    [asset.owned?.quantity, asset.quantity],
  )
  const isSingle = useMemo(
    () => asset.collection.standard === 'ERC721',
    [asset.collection.standard],
  )
  const directSales = asset.sales.nodes

  return (
    <Stack spacing={8}>
      {directSales && directSales.length > 0 ? (
        <>
          <SaleDirectSummary sales={directSales} isSingle={isSingle} />
          <SaleDirectButton
            assetId={asset.id}
            chainId={asset.collection.chainId}
            sales={directSales}
            isHomepage={isHomepage}
            ownAllSupply={ownAllSupply}
            onOfferCanceled={onOfferCanceled}
          />
          <SaleDirectInfo
            assetId={asset.id}
            chainId={asset.collection.chainId}
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
            assetId={asset.id}
            isEnded={ended}
            isOwner={isOwner}
            isHomepage={isHomepage}
          />
          <SaleAuctionInfo
            assetId={asset.id}
            chainId={asset.collection.chainId}
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
            assetId={asset.id}
            isHomepage={isHomepage}
            ownAllSupply={ownAllSupply}
          />
          <SaleOpenInfo
            assetId={asset.id}
            isHomepage={isHomepage}
            isOwner={isOwner}
          />
        </>
      )}
    </Stack>
  )
}

export default SaleDetail
