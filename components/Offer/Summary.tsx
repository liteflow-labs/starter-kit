import { Flex, Heading, Skeleton, Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import Price from '../Price/Price'

type Props = {
  currency: {
    decimals: number
    symbol: string
  }
  isSingle: boolean
  price: BigNumber
  quantity: BigNumber
  feesOnTopPerTenThousand?: number | undefined
  noFees?: boolean
}

const Summary: FC<Props> = ({
  currency,
  price,
  quantity,
  isSingle,
  feesOnTopPerTenThousand,
  noFees,
}) => {
  const { t } = useTranslation('components')
  const totalPrice = useMemo(() => price.mul(quantity), [quantity, price])
  const totalFees = useMemo(() => {
    if (noFees) return BigNumber.from(0)
    if (feesOnTopPerTenThousand === undefined) return
    return totalPrice.mul(feesOnTopPerTenThousand).div(10000)
  }, [noFees, feesOnTopPerTenThousand, totalPrice])

  return (
    <div>
      {isSingle ? (
        <Heading as="h5" variant="heading3" color="gray.500" mb={2}>
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
              {quantity.toString()}
            </Text>
          </Heading>
        </>
      )}
      {!noFees && (
        <>
          {feesOnTopPerTenThousand === undefined || totalFees === undefined ? (
            <Skeleton noOfLines={1} height={4} width={200} mt={4} />
          ) : (
            <Heading as={Flex} variant="heading3" color="gray.500" mb={2}>
              {t('offer.summary.fees', {
                value: feesOnTopPerTenThousand / 100,
              })}
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
        </>
      )}
      {totalFees === undefined ? (
        <Skeleton noOfLines={1} height={4} width={200} mt={4} />
      ) : (
        <Heading as={Flex} variant="heading3" color="gray.500">
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
      )}
    </div>
  )
}

export default Summary
