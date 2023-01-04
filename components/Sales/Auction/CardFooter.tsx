import { Flex, HStack, Icon, Stack, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { HiClock } from '@react-icons/all-files/hi/HiClock'
import useTranslation from 'next-translate/useTranslation'
import { VFC } from 'react'
import Countdown from '../../Countdown/Countdown'
import Link from '../../Link/Link'
import Price from '../../Price/Price'

type Props = {
  href: string
  endAt: Date
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
  href,
  endAt,
  bestBid,
  isOwner,
  showButton = true,
}) => {
  const { t } = useTranslation('components')
  return (
    <Stack spacing={4}>
      <HStack spacing={1} px={4}>
        <Icon as={HiClock} h={4} w={4} color="gray.500" />
        <Text as="span" variant="subtitle2" color="gray.500">
          <Countdown date={endAt} />
        </Text>
      </HStack>
      <Flex
        as={Link}
        color={isOwner ? 'white' : 'gray.500'}
        bgColor={isOwner ? 'brand.500' : 'gray.100'}
        py={2}
        px={4}
        fontSize="sm"
        fontWeight="semibold"
        href={href}
        gap={1}
        visibility={showButton ? 'visible' : 'hidden'}
      >
        {isOwner ? (
          <Text variant="subtitle2">{t('sales.auction.card-footer.view')}</Text>
        ) : (
          <>
            <Text variant="subtitle2">
              {t('sales.auction.card-footer.highest-bid')}
            </Text>
            {bestBid ? (
              <Text
                as={Price}
                variant="subtitle2"
                amount={bestBid.unitPrice}
                currency={bestBid.currency}
                color="brand.black"
              />
            ) : (
              <Text variant="subtitle2" color="brand.black">
                {t('sales.auction.card-footer.no-bids')}
              </Text>
            )}
          </>
        )}
      </Flex>
    </Stack>
  )
}

export default SaleAuctionCardFooter
