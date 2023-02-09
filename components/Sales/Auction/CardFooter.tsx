import { Flex, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import useTranslation from 'next-translate/useTranslation'
import { VFC } from 'react'
import Link from '../../Link/Link'
import Price from '../../Price/Price'

type Props = {
  assetId: string
  bestBid:
    | {
        unitPrice: BigNumber
        currency: {
          decimals: number
          symbol: string
        }
      }
    | undefined
  isOwner: boolean
  showButton?: boolean
}

const SaleAuctionCardFooter: VFC<Props> = ({
  assetId,
  bestBid,
  isOwner,
  showButton = true,
}) => {
  const { t } = useTranslation('components')
  return (
    <Flex
      as={Link}
      color={showButton ? 'white' : 'gray.500'}
      bgColor={showButton ? 'brand.500' : 'gray.100'}
      py={2}
      px={4}
      fontSize="sm"
      fontWeight="semibold"
      href={`/tokens/${assetId}${!isOwner ? '/bid' : ''}`}
    >
      {showButton ? (
        isOwner ? (
          t('sales.auction.card-footer.view')
        ) : (
          t('sales.auction.card-footer.place-bid')
        )
      ) : bestBid ? (
        <Flex gap={1}>
          <Text variant="subtitle2">
            {t('sales.auction.card-footer.highest-bid')}
          </Text>
          <Text
            as={Price}
            variant="subtitle2"
            amount={bestBid.unitPrice}
            currency={bestBid.currency}
            color="brand.black"
          />
        </Flex>
      ) : (
        t('sales.auction.card-footer.ongoing-auction')
      )}
    </Flex>
  )
}

export default SaleAuctionCardFooter
