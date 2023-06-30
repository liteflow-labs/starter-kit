import { Flex, Heading, Stack } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import Image from '../../Image/Image'

export type Props = {
  currencies: {
    image: string
  }[]
}

const SaleOpenSummary: FC<Props> = ({ currencies }) => {
  const { t } = useTranslation('components')
  return (
    <Stack spacing={3}>
      <Heading as="h5" variant="heading3" color="gray.500">
        {t('sales.open.summary.open')}
      </Heading>
      <Flex _first={{ ml: 0 }}>
        {currencies.map((currency, i) => (
          <Flex
            position="relative"
            as="span"
            align="center"
            justify="center"
            h={8}
            w={8}
            overflow="hidden"
            rounded="full"
            borderWidth="1px"
            borderColor="gray.200"
            ml={i > 0 ? -2 : undefined}
            key={i}
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
        <Heading as="h2" variant="subtitle" color="brand.black" ml={2}>
          {t('sales.open.summary.offer')}
        </Heading>
      </Flex>
    </Stack>
  )
}

export default SaleOpenSummary
