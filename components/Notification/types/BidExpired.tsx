import { Text } from '@chakra-ui/react'
import Trans from 'next-translate/Trans'
import Price from '../../Price/Price'

export type IProps = {
  currentAccount: string
  offer: {
    amount: string
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

export default function BidExpired({ currentAccount, offer }: IProps): {
  link: string
  image: string
  children: JSX.Element
} {
  return {
    link: `/users/${currentAccount}/bids/placed`,
    image: offer.asset.image,
    children: (
      <Trans
        ns="components"
        i18nKey="notification.bid.expired"
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
