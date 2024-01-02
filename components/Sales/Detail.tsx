import { Stack } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { FC, useMemo } from 'react'
import { AccountVerificationStatus, Standard } from '../../graphql'
import SaleDirectButton from './Direct/Button'
import SaleDirectSummary from './Direct/Summary'
import SaleOpenButton from './Open/Button'
import SaleOpenSummary from './Open/Summary'
import SaleAction from './SaleAction'

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
  }
  currencies: {
    chainId: number
    image: string
  }[]
  isHomepage: boolean

  // Callbacks
  onOfferCanceled: (id: string) => Promise<void>
}

const SaleDetail: FC<Props> = ({
  asset,
  currencies,
  isHomepage,
  onOfferCanceled,
}) => {
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
        </>
      ) : (
        <>
          <SaleOpenSummary currencies={currencies} />
          <SaleOpenButton
            assetId={asset.id}
            isHomepage={isHomepage}
            ownAllSupply={ownAllSupply}
          />
        </>
      )}
      <SaleAction
        assetId={asset.id}
        isHomepage={isHomepage}
        isOwner={isOwner}
      />
    </Stack>
  )
}

export default SaleDetail
