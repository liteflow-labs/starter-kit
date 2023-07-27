import { Text } from '@chakra-ui/react'
import Trans from 'next-translate/Trans'
import { JSX } from 'react'
import Price from '../../Price/Price'

export type IProps = {
  currentAccount: string
  offer: {
    unitPrice: string
    quantity: string
    asset: {
      image: string
      name: string
    }
    currency: {
      decimals: number
      symbol: string
    }
  }
}

export default function BidAccepted({ currentAccount, offer }: IProps): {
  link: string
  image: string
  children: JSX.Element
} {
  return {
    link: `/users/${currentAccount}/trades/purchased`,
    image: offer.asset.image,
    children: (
      <Trans
        ns="components"
        i18nKey="notification.bid.accepted"
        components={[
          <Text as="span" fontWeight="bold" key="1" />,
          <Text as="span" fontWeight="bold" key="2" />,
          <Text as="span" fontWeight="bold" key="price">
            <Price amount={offer.unitPrice} currency={offer.currency} />
          </Text>,
        ]}
        values={{ count: parseInt(offer.quantity, 10), name: offer.asset.name }}
      />
    ),
  }
}
