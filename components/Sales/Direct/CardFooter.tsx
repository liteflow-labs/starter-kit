import { Divider, Flex, HStack, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import AddToCartButton from '../../Button/AddToCart'
import Link from '../../Link/Link'
import Price from '../../Price/Price'

type Props = {
  saleId: string
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

const SaleDirectCardFooter: FC<Props> = ({
  saleId,
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
          <>
            <Text as="span" variant="subtitle2" color="gray.500" mr={1}>
              {t('sales.direct.card-footer.price')}
            </Text>
            <Text as="span" variant="subtitle2" color="brand.black">
              <Price
                amount={unitPrice}
                currency={currency}
                averageFrom={100000}
              />
            </Text>
          </>
        )
      default:
        return hasMultiCurrency ? (
          <Text as="span" variant="subtitle2" color="gray.500">
            {t('sales.direct.card-footer.offers', {
              count: numberOfSales,
            })}
          </Text>
        ) : (
          <>
            <Text as="span" variant="subtitle2" color="gray.500" mr={1}>
              {t('sales.direct.card-footer.from')}
            </Text>
            <Text as="span" variant="subtitle2" color="brand.black">
              <Price
                amount={unitPrice}
                currency={currency}
                averageFrom={100000}
              />
            </Text>
          </>
        )
    }
  }, [numberOfSales, unitPrice, currency, hasMultiCurrency, t])

  return (
    <HStack gap={0}>
      <Flex
        as={Link}
        href={`/checkout/${saleId}`}
        py={2}
        px={4}
        bgColor={showButton ? 'brand.500' : 'gray.100'}
        flexGrow={1}
        transition="none"
      >
        <Text
          variant="subtitle2"
          color={showButton ? 'white' : 'gray.500'}
          noOfLines={1}
          wordBreak="break-all"
        >
          {showButton
            ? isOwner
              ? t('sales.direct.card-footer.view')
              : t('sales.direct.card-footer.purchase')
            : chip}
        </Text>
      </Flex>
      {showButton && (
        <>
          <Divider orientation="vertical" />
          <AddToCartButton
            offerId={saleId}
            isDisabled={isOwner}
            borderRadius="none"
            // add isDisabled prop when the item on the carts are on different chains
            // also add a tooltip to explain why
            h={9}
          />
        </>
      )}
    </HStack>
  )
}

export default SaleDirectCardFooter
