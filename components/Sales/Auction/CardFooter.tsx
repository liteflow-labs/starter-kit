import { Avatar, Flex, HStack, Icon, Tag, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { HiOutlineClock } from '@react-icons/all-files/hi/HiOutlineClock'
import useTranslation from 'next-translate/useTranslation'
import React, { VFC } from 'react'
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
}

const SaleAuctionCardFooter: VFC<Props> = ({ href, endAt, bestBid }) => {
  const { t } = useTranslation('components')
  return (
    <div>
      <Tag
        as={HStack}
        spacing={2}
        size="lg"
        variant="outline"
        borderRadius="full"
        boxShadow="none"
        border="1px"
        borderColor="gray.200"
      >
        <Avatar
          icon={<Icon as={HiOutlineClock} h={4} w={4} color="white" />}
          size="sm"
          bg="brand.500"
          ml={-3}
        />
        <Text as="span" variant="button2" color="brand.black">
          <Countdown date={endAt} />
        </Text>
      </Tag>
      <Flex
        as={Link}
        justify="space-between"
        color="brand.500"
        mt={3.5}
        w="full"
        fontSize="sm"
        fontWeight="semibold"
        href={href}
      >
        {bestBid ? (
          <>
            {t('sales.auction.card-footer.highest-bid')}
            <Text
              as={Price}
              ml={1}
              amount={bestBid.unitPrice}
              currency={bestBid.currency}
            />
          </>
        ) : (
          t('sales.auction.card-footer.place-bid')
        )}
      </Flex>
    </div>
  )
}

export default SaleAuctionCardFooter
