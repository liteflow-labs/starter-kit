import { Flex, Heading, Stack, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import Image from '../../Image/Image'

export type Props = {
  currencies: {
    image: string
  }[]
}

const SLICE_LIMIT = 5

const SaleOpenSummary: FC<Props> = ({ currencies }) => {
  const { t } = useTranslation('components')

  const currencyStyles = {
    align: 'center',
    justify: 'center',
    h: 8,
    w: 8,
    overflow: 'hidden',
    rounded: 'full',
    borderWidth: '1px',
    borderColor: 'gray.200',
  }

  return (
    <Stack spacing={3}>
      <Heading as="h5" variant="heading3" color="gray.500">
        {t('sales.open.summary.open')}
      </Heading>
      <Flex _first={{ ml: 0 }}>
        {currencies.slice(0, SLICE_LIMIT).map((currency, i) => (
          <Flex
            key={i}
            as="span"
            position="relative"
            ml={i > 0 ? -2 : undefined}
            {...currencyStyles}
          >
            <Image
              src={currency.image}
              alt="Currency Logo"
              fill
              sizes="30px"
              objectFit="cover"
            />
          </Flex>
        ))}
        {currencies.length > SLICE_LIMIT && (
          <Flex ml={-2} zIndex={10}>
            <Flex as="span" bgColor="brand.50" {...currencyStyles}>
              <Text as="span" variant="caption" color="brand.500">
                {`+${
                  currencies.length >= 103
                    ? 99
                    : currencies.length - SLICE_LIMIT
                }`}
              </Text>
            </Flex>
          </Flex>
        )}
        <Heading as="h2" variant="subtitle" color="brand.black" ml={2}>
          {t('sales.open.summary.offer')}
        </Heading>
      </Flex>
    </Stack>
  )
}

export default SaleOpenSummary
