import { Box, Flex, Heading, Icon } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { HiOutlineClock } from '@react-icons/all-files/hi/HiOutlineClock'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import { formatDate } from '../../../utils'
import Image from '../../Image/Image'
import Price from '../../Price/Price'

type Props = {
  isSingle: boolean
  sales: {
    unitPrice: BigNumber
    currency: {
      id: string
      decimals: number
      image: string
      symbol: string
    }
    expiredAt: Date | null | undefined
  }[]
}

const SaleDirectSummary: FC<Props> = ({ sales, isSingle }) => {
  const { t } = useTranslation('components')
  const salesWithUniqueCurrency = useMemo(() => {
    return sales.reduce(
      (acc, sale) =>
        acc.some((x) => x.currency.id === sale.currency.id)
          ? acc
          : [...acc, sale],
      [] as typeof sales,
    )
  }, [sales])

  const image = useMemo(() => {
    switch (sales.length) {
      case 0:
        return
      case 1: {
        if (!sales[0]) return
        return (
          <Box
            position="relative"
            h={8}
            w={8}
            overflow="hidden"
            rounded="full"
            border="1px"
            borderColor="gray.200"
          >
            <Image
              src={sales[0].currency.image}
              alt={`${sales[0].currency.symbol} Logo`}
              fill
              sizes="30px"
              objectFit="cover"
            />
          </Box>
        )
      }
      default: {
        return (
          <Flex _first={{ ml: 0 }}>
            {salesWithUniqueCurrency.map((x, i) => (
              <Box
                position="relative"
                h={8}
                w={8}
                overflow="hidden"
                rounded="full"
                border="1px"
                borderColor="gray.200"
                ml={i > 0 ? -2 : undefined}
                key={i}
              >
                <Image
                  src={x.currency.image}
                  alt={`${x.currency.symbol} Logo`}
                  fill
                  sizes="30px"
                  objectFit="cover"
                />
              </Box>
            ))}
          </Flex>
        )
      }
    }
  }, [sales, salesWithUniqueCurrency])

  const subtitle = useMemo(() => {
    switch (sales.length) {
      case 0:
        return
      case 1:
        if (!sales[0]) return
        return (
          <Price amount={sales[0].unitPrice} currency={sales[0].currency} />
        )
      default:
        if (!sales[0]) return
        return salesWithUniqueCurrency.length === 1 ? (
          <Price amount={sales[0].unitPrice} currency={sales[0].currency} />
        ) : (
          t('sales.direct.summary.offer', { count: sales.length })
        )
    }
  }, [sales, salesWithUniqueCurrency, t])

  const caption = useMemo(() => {
    switch (sales.length) {
      case 0:
        return
      case 1:
        return isSingle ? undefined : t('sales.direct.summary.per-edition')
      default:
        return salesWithUniqueCurrency.length === 1
          ? isSingle
            ? undefined
            : t('sales.direct.summary.per-edition')
          : t('sales.direct.summary.available')
    }
  }, [sales, isSingle, salesWithUniqueCurrency, t])

  const title = useMemo(
    () =>
      sales.length > 1 && salesWithUniqueCurrency.length === 1
        ? t('sales.direct.summary.on-sale-from')
        : t('sales.direct.summary.on-sale-for'),
    [sales, salesWithUniqueCurrency, t],
  )

  return (
    <Flex wrap="wrap" gap={8}>
      <Flex direction="column" gap={3}>
        <Heading as="h5" variant="heading3" color="gray.500">
          {title}
        </Heading>
        <Flex gap={2}>
          {image}
          <Heading as="h2" variant="subtitle" color="brand.black">
            {subtitle}
            {caption && (
              <Heading as="span" variant="heading3" color="gray.500" ml={3}>
                {caption}
              </Heading>
            )}
          </Heading>
        </Flex>
      </Flex>
      {sales.length === 1 && sales[0]?.expiredAt && (
        <Flex direction="column" gap={3}>
          <Heading as="h5" variant="heading3" color="gray.500">
            {t('sales.direct.summary.expires')}
          </Heading>
          <Flex h="full" align="center" gap={1}>
            <Icon as={HiOutlineClock} h={5} w={5} color="gray.400" />
            <Heading as="h5" variant="heading3" color="gray.500">
              {formatDate(sales[0].expiredAt)}
            </Heading>
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}

export default SaleDirectSummary
