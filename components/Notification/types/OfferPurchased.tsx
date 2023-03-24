import { Text } from '@chakra-ui/react'
import { formatAddress } from '@nft/hooks'
import Trans from 'next-translate/Trans'
import Price from '../../Price/Price'

export type IProps = {
  currentAccount: string
  offer: {
    amount: string
    unitPrice: string
    currency: {
      decimals: number
      symbol: string
    }
    asset: {
      image: string
      name: string
    }
  }
  trade: {
    quantity: string
    buyerAddress: string
    buyer: {
      username: string | null
    } | null
  } | null
}

export default function OfferPurchased({
  currentAccount,
  offer,
  trade,
}: IProps): {
  link: string
  image: string
  children: JSX.Element
} {
  return {
    link: `/users/${currentAccount}/trades`,
    image: offer.asset.image,
    children: trade ? (
      <Trans
        ns="components"
        i18nKey="notification.offer.purchased"
        components={[
          <Text as="span" fontWeight="bold" key="1" />,
          <Text as="span" fontWeight="bold" key="2" />,
          <Text as="span" fontWeight="bold" key="3" />,
          <Text as="span" fontWeight="bold" key="4">
            <Price amount={offer.unitPrice} currency={offer.currency} />
          </Text>,
        ]}
        values={{
          count: parseInt(trade.quantity, 10),
          name: offer.asset.name,
          account: trade.buyer?.username || formatAddress(trade.buyerAddress),
        }}
      />
    ) : (
      <Trans
        ns="components"
        i18nKey="notification.offer.purchased.short"
        components={[
          <Text as="span" fontWeight="bold" key="1" />,
          <Text as="span" fontWeight="bold" key="2">
            <Price amount={offer.unitPrice} currency={offer.currency} />
          </Text>,
        ]}
        values={{ name: offer.asset.name }}
      />
    ),
  }
}
