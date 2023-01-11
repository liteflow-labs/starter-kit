import { Flex, HStack, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import useTranslation from 'next-translate/useTranslation'
import { useMemo, VFC } from 'react'
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
  isOwner: boolean
  showButton?: boolean
}

const SaleDirectCardFooter: VFC<Props> = ({
  href,
  numberOfSales,
  unitPrice,
  currency,
  hasMultiCurrency,
  isOwner,
  showButton = true,
}) => {
  const { t } = useTranslation('components')
  const chip = useMemo(() => {
    switch (numberOfSales) {
      case 0:
        return
      case 1:
        return (
          <HStack spacing={1}>
            <Text as="span" variant="subtitle2" color="gray.500">
              {t('sales.direct.card-footer.price')}
            </Text>
            <Text as="span" variant="subtitle2" color="brand.black">
              <Price
                amount={unitPrice}
                currency={currency}
                averageFrom={100000}
              />
            </Text>
          </HStack>
        )
      default:
        return hasMultiCurrency ? (
          <Text as="span" variant="subtitle2" color="gray.500">
            {t('sales.direct.card-footer.offers', {
              count: numberOfSales,
            })}
          </Text>
        ) : (
          <HStack spacing={1}>
            <Text as="span" variant="subtitle2" color="gray.500">
              {t('sales.direct.card-footer.from')}
            </Text>
            <Text as="span" variant="subtitle2" color="brand.black">
              <Price
                amount={unitPrice}
                currency={currency}
                averageFrom={100000}
              />
            </Text>
          </HStack>
        )
    }
  }, [numberOfSales, unitPrice, currency, hasMultiCurrency, t])

  return (
    <Flex
      as={Link}
      color={showButton ? 'white' : 'gray.500'}
      bgColor={showButton ? 'brand.500' : 'gray.100'}
      py={2}
      px={4}
      fontSize="sm"
      fontWeight="semibold"
      href={href}
    >
      {showButton
        ? isOwner
          ? t('sales.direct.card-footer.view')
          : t('sales.direct.card-footer.purchase')
        : chip}
    </Flex>
  )
}

export default SaleDirectCardFooter
