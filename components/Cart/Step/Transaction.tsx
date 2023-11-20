import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Card,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { FaCheck } from '@react-icons/all-files/fa/FaCheck'
import { HiOutlineX } from '@react-icons/all-files/hi/HiOutlineX'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { FetchCartItemsQuery } from '../../../graphql'
import Image from '../../Image/Image'
import List, { ListItem } from '../../List/List'
import Price from '../../Price/Price'

type Props = {
  cartItems: NonNullable<FetchCartItemsQuery['offerOpenSales']>['nodes']
  chain: { id: number; name: string; image: string }
}

const CartTransactionStep: FC<Props> = ({ cartItems, chain }) => {
  const { t } = useTranslation('components')
  const { setValue, watch } = useFormContext()
  const currencies = watch('currencies')

  const uniqueCurrencies = useMemo(() => {
    const currencies: {
      id: string
      decimals: number
      symbol: string
      approved: boolean
    }[] = []
    cartItems.forEach((item) => {
      !currencies.some((currency) => item.currency.id === currency.id) &&
        currencies.push({ ...item.currency, approved: false })
    })
    return currencies
  }, [cartItems])

  useEffect(() => {
    if (
      currencies === undefined &&
      uniqueCurrencies &&
      uniqueCurrencies.length > 0
    ) {
      setValue('currencies', uniqueCurrencies)
    }
  }, [currencies, setValue, uniqueCurrencies])

  if (cartItems.length === 0)
    return (
      <VStack px={2} alignItems="flex-start" width="full">
        <Alert status="warning" borderRadius="xl">
          <AlertIcon />
          <Box fontSize="sm">
            <AlertTitle>{t('cart.step.transaction.empty.title')}</AlertTitle>
            <AlertDescription fontSize="xs">
              {t('cart.step.transaction.empty.description')}
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    )

  return (
        <VStack px={2} alignItems="flex-start" width="full" spacing={3}>
          <CartItemSummary cartItems={cartItems} chainId={chainId} />
          <Text variant="subtitle2">
