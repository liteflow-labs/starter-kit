import { Text } from '@chakra-ui/react'
import Trans from 'next-translate/Trans'
import { JSX } from 'react'

export type IProps = {
  auction: {
    asset: {
      id: string
      image: string
      name: string
    }
  }
}

export default function AuctionEndedReservePriceBuyer({ auction }: IProps): {
  link: string
  image: string
  children: JSX.Element
} {
  return {
    link: `/tokens/${auction.asset.id}`,
    image: auction.asset.image,
    children: (
      <Trans
        ns="components"
        i18nKey="notification.auction.ended.reserve-price-buyer"
        components={[<Text as="span" fontWeight="bold" key="text" />]}
        values={{ name: auction.asset.name }}
      />
    ),
  }
}
