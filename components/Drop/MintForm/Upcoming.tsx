import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import numbro from 'numbro'
import { FC, JSX } from 'react'
import Countdown from '../../Countdown/Countdown'
import Image from '../../Image/Image'
import Price from '../../Price/Price'

type Props = {
  drop: {
    name: string
    startDate: Date
    unitPrice: string
    supply: string | null
    maxQuantityPerWallet: string | null
    currency: {
      decimals: number
      symbol: string
      image: string
    }
  }
}

const MintFormUpcoming: FC<Props> = ({ drop }): JSX.Element => {
  const { t } = useTranslation('components')
  return (
    <Box
      borderWidth="1px"
      borderRadius="2xl"
      bg="brand.50"
      width="full"
      overflow="hidden"
    >
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing={4}
        width="full"
        p={4}
        alignItems="center"
      >
        <Flex flexDirection="column" gap={1} width="full">
          <Heading variant="heading2" title={drop.name} noOfLines={1}>
            {drop.name}
          </Heading>
          <HStack alignItems="center" spacing={1}>
            <Text variant="subtitle2" color="gray.500" mr={2}>
              {t('drop.form.upcoming.price')}
            </Text>
            <Image
              src={drop.currency.image}
              alt={drop.currency.symbol}
              width={12}
              height={12}
              w={3}
              h={3}
            />
            <Text variant="subtitle2">
              <Price amount={drop.unitPrice} currency={drop.currency} />
            </Text>
          </HStack>
          {drop.supply && (
            <HStack alignItems="center" spacing={1}>
              <Text variant="subtitle2" color="gray.500" mr={2}>
                {t('drop.form.upcoming.supply')}
              </Text>
              <Text variant="subtitle2">
                {numbro(drop.supply).format({
                  thousandSeparated: true,
                })}
              </Text>
            </HStack>
          )}
          {drop.maxQuantityPerWallet && (
            <HStack alignItems="center" spacing={1}>
              <Text variant="subtitle2" color="gray.500" mr={2}>
                {t('drop.form.upcoming.mintLimit')}
              </Text>
              <Text variant="subtitle2">
                {t('drop.form.upcoming.limit', {
                  maxQuantityPerWallet: numbro(
                    drop.maxQuantityPerWallet,
                  ).format({
                    thousandSeparated: true,
                  }),
                })}
              </Text>
            </HStack>
          )}
        </Flex>
        <Button isDisabled>{t('drop.form.upcoming.disabled')}</Button>
      </SimpleGrid>
      <Divider />
      <Flex alignItems="center" justifyContent="center" px={4} py={3}>
        <Text variant="subtitle2">
          <Trans
            ns="components"
            i18nKey="drop.form.upcoming.startsIn"
            components={[<Countdown date={drop.startDate} key="countdown" />]}
          />
        </Text>
      </Flex>
    </Box>
  )
}

export default MintFormUpcoming
