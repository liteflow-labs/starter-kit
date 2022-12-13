import { Flex, Heading, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import useTranslation from 'next-translate/useTranslation'
import React, { FC, HTMLAttributes, useMemo } from 'react'
import Price from '../Price/Price'

const Summary: FC<
  HTMLAttributes<any> & {
    currency: {
      decimals: number
      symbol: string
    }
    isSingle: boolean
    price: BigNumber
    quantity?: number | string
    feesOnTopPerTenThousand?: number
  }
> = ({ currency, price, quantity, isSingle, feesOnTopPerTenThousand }) => {
  const { t } = useTranslation('components')
  const totalPrice = useMemo(() => {
    if (!quantity) return BigNumber.from(0)
    return price.mul(quantity)
  }, [quantity, price])

  const totalFees = useMemo(() => {
    if (!totalPrice) return BigNumber.from(0)
    if (!feesOnTopPerTenThousand) return BigNumber.from(0)
    return totalPrice.mul(feesOnTopPerTenThousand).div(10000)
  }, [totalPrice, feesOnTopPerTenThousand])

  return (
    <>
      {isSingle ? (
        <Heading as="h5" variant="heading3" color="gray.500">
          {t('offer.summary.single')}
        </Heading>
      ) : (
        <>
          <Heading as={Flex} variant="heading3" color="gray.500" mb={2}>
            {t('offer.summary.price')}
            <Text
              as={Price}
              amount={price}
              currency={currency}
              color="brand.black"
              ml={1}
              fontWeight="semibold"
            />
          </Heading>
          <Heading as={Flex} variant="heading3" color="gray.500" mb={2}>
            {t('offer.summary.quantity')}
            <Text as="span" color="brand.black" ml={1} fontWeight="semibold">
              {quantity}
            </Text>
          </Heading>
        </>
      )}
      {feesOnTopPerTenThousand && (
        <Heading as={Flex} variant="heading3" color="gray.500" mb={2}>
          {t('offer.summary.fees', { value: feesOnTopPerTenThousand / 100 })}
          <Text
            as={Price}
            amount={totalFees}
            currency={currency}
            color="brand.black"
            ml={1}
            fontWeight="semibold"
          />
        </Heading>
      )}
      <Heading as={Flex} variant="heading3" color="gray.500" mb={8}>
        {t('offer.summary.total')}
        <Text
          as={Price}
          amount={totalPrice.add(totalFees)}
          currency={currency}
          color="brand.black"
          ml={1}
          fontWeight="semibold"
        />
      </Heading>
    </>
  )
}

export default Summary
