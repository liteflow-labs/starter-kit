import { Text } from '@chakra-ui/react'
import Trans from 'next-translate/Trans'
import { JSX } from 'react'
import Price from '../../Price/Price'

export type IProps = {
  auction: {
    asset: {
      image: string
      name: string
    }
  }
  currentAccount: string
  offer: {
    amount: string
    currency: {
      decimals: number
      symbol: string
    }
  }
}

export default function AuctionExpireSoon({
  auction,
  currentAccount,
  offer,
}: IProps): {
  link: string
  image: string
  children: JSX.Element
} {
  return {
    link: `/users/${currentAccount}/offers/auction`,
    image: auction.asset.image,
    children: (
      <Trans
        ns="components"
        i18nKey="notification.auction.expire-soon"
        components={[
          <Text as="span" fontWeight="bold" key="text" />,
          <Text as="span" fontWeight="bold" key="price">
            <Price amount={offer.amount} currency={offer.currency} />
          </Text>,
        ]}
        values={{ name: auction.asset.name }}
      />
    ),
  }
}
