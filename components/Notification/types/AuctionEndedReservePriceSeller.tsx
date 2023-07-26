import { Text } from '@chakra-ui/react'
import Trans from 'next-translate/Trans'
import { JSX } from 'react'

export type IProps = {
  auction: {
    asset: {
      image: string
      name: string
    }
  }
  currentAccount: string
}

export default function AuctionEndedReservePriceSeller({
  auction,
  currentAccount,
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
        i18nKey="notification.auction.ended.reserve-price-seller"
        components={[<Text as="span" fontWeight="bold" key="text" />]}
        values={{ name: auction.asset.name }}
      />
    ),
  }
}
