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
            <AlertTitle>Items Unavailable</AlertTitle>
            <AlertDescription fontSize="xs">
              The items on your cart has been purchased by someone else, the
              seller has removed it from sale, or the listing has expired.
              Please add new items to your cart and try again.
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    )

  return (
    <VStack px={2} alignItems="flex-start" width="full" spacing={3}>
      <HStack gap={1}>
        <Text variant="subtitle2">Summary</Text>
        <Image
          src={chain.image}
          alt={chain.name}
          width={16}
          height={16}
          h={4}
          w={4}
          ml={1}
        />
      </HStack>
      <Card width="full" p={1}>
        {cartItems.map((cartItem, i) => (
          <ListItem
            key={i}
            image={
              <Image
                src={cartItem.asset.image}
                alt={cartItem.asset.name}
                width={24}
                height={24}
                w={6}
                h={6}
                objectFit="cover"
              />
            }
            label={
              <Text
                variant="subtitle2"
                color="gray.800"
                title={cartItem.asset.name}
              >
                {cartItem.asset.name}
              </Text>
            }
            action={
              <Text variant="subtitle2" textAlign="end">
                <Price
                  amount={cartItem.unitPrice}
                  currency={cartItem.currency}
                />
              </Text>
            }
            imageSize={6}
          />
        ))}
      </Card>
      <Text variant="subtitle2">Price</Text>
      <List width="full">
        {uniqueCurrencies.map((currency, i) => (
          <ListItem
            key={i}
            label={
              <Price
                amount={cartItems
                  .filter((item) => item.currency.id === currency.id)
                  .reduce(
                    (acc, item) => acc.add(BigNumber.from(item.unitPrice)),
                    BigNumber.from(0),
                  )}
                currency={currency}
              />
            }
            action={
              currency.approved ? (
                <Icon as={FaCheck} color="green.400" />
              ) : (
                <Icon as={HiOutlineX} color="red.400" />
              )
            }
            p={0}
          />
        ))}
      </List>
    </VStack>
  )
}

export default CartTransactionStep
