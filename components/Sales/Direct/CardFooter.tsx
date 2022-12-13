import { Flex, HStack, Tag, TagLabel, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import useTranslation from 'next-translate/useTranslation'
import React, { useMemo, VFC } from 'react'
import Link from '../../Link/Link'
import Price from '../../Price/Price'

type Props = {
  href: string
  numberOfSales: number
  unitPrice: BigNumber
  currency: {
    decimals: number
    symbol: string
  }
  hasMultiCurrency: boolean
}

const SaleDirectCardFooter: VFC<Props> = ({
  href,
  numberOfSales,
  unitPrice,
  currency,
  hasMultiCurrency,
}) => {
  const { t } = useTranslation('components')
  const chip = useMemo(() => {
    switch (numberOfSales) {
      case 0:
        return
      case 1:
        return (
          <Tag
            as="div"
            size="lg"
            variant="outline"
            borderRadius="full"
            boxShadow="none"
            border="1px"
            borderColor="gray.200"
          >
            <TagLabel as={HStack} spacing={1}>
              <Text as="span" variant="text-sm" color="brand.black">
                {t('sales.direct.card-footer.price')}
              </Text>
              <Text as="span" variant="button2" color="brand.black">
                <Price
                  amount={unitPrice}
                  currency={currency}
                  averageFrom={100000}
                />
              </Text>
            </TagLabel>
          </Tag>
        )
      default:
        return hasMultiCurrency ? (
          <Tag
            size="lg"
            variant="outline"
            borderRadius="full"
            boxShadow="none"
            border="1px"
            borderColor="gray.200"
          >
            <TagLabel>
              <Text as="span" variant="text-sm" color="brand.black">
                {t('sales.direct.card-footer.offers', {
                  count: numberOfSales,
                })}
              </Text>
            </TagLabel>
          </Tag>
        ) : (
          <Tag
            as="div"
            size="lg"
            variant="outline"
            borderRadius="full"
            boxShadow="none"
            border="1px"
            borderColor="gray.200"
          >
            <TagLabel as={HStack} spacing={1}>
              <Text as="span" variant="text-sm" color="brand.black">
                {t('sales.direct.card-footer.from')}
              </Text>
              <Text as="span" variant="button2" color="brand.black">
                <Price
                  amount={unitPrice}
                  currency={currency}
                  averageFrom={100000}
                />
              </Text>
            </TagLabel>
          </Tag>
        )
    }
  }, [numberOfSales, unitPrice, currency, hasMultiCurrency, t])

  return (
    <div>
      {chip}
      <Flex
        as={Link}
        href={href}
        mt={3.5}
        w="full"
        color="brand.500"
        justify="space-between"
        fontSize="sm"
        fontWeight="semibold"
      >
        {t('sales.direct.card-footer.purchase')}
      </Flex>
    </div>
  )
}

export default SaleDirectCardFooter
