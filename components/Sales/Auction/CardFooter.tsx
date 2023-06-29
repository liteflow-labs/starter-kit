import { Flex, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
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

const SaleAuctionCardFooter: FC<Props> = ({
  assetId,
  bestBid,
  isOwner,
  showButton = true,
}) => {
  const { t } = useTranslation('components')
  return (
    <Flex
      as={Link}
      href={`/tokens/${assetId}${!isOwner ? '/bid' : ''}`}
      py={2}
      px={4}
      bgColor={showButton ? 'brand.500' : 'gray.100'}
    >
      <Text
        variant="subtitle2"
        color={showButton ? 'white' : 'gray.500'}
        noOfLines={1}
        wordBreak="break-all"
      >
        {showButton ? (
          isOwner ? (
            t('sales.auction.card-footer.view')
          ) : (
            t('sales.auction.card-footer.place-bid')
          )
        ) : bestBid ? (
          <>
            <Text as="span" variant="subtitle2" mr={1}>
              {t('sales.auction.card-footer.highest-bid')}
            </Text>
            <Text
              as={Price}
              variant="subtitle2"
              amount={bestBid.unitPrice}
              currency={bestBid.currency}
              color="brand.black"
            />
          </>
        ) : (
          t('sales.auction.card-footer.ongoing-auction')
        )}
      </Text>
    </Flex>
  )
}

export default SaleAuctionCardFooter
