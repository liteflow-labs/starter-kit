import {
  Box,
  Button,
  CloseButton,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  SkeletonCircle,
  SkeletonText,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react'
import CartErrorStep from 'components/Cart/Step/Error'
import CartSelectionStep from 'components/Cart/Step/Selection'
import CartSuccessStep from 'components/Cart/Step/Success'
import CartTransactionStep from 'components/Cart/Step/Transaction'
import CartTransactionStepButton from 'components/Cart/Step/TransactionButton'
import { useRouter } from 'next/router'
import { FC, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import invariant from 'ts-invariant'
import { useFetchCartItemsLazyQuery } from '../../graphql'
import useCart from '../../hooks/useCart'
import useEnvironment from '../../hooks/useEnvironment'
import { useOrderByKey } from '../../hooks/useOrderByKey'
import Link from '../Link/Link'
import List, { ListItem } from '../List/List'
import CartSelectionStepButton from './Step/SelectionButton'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export type FormData = {
  chainId: number
  currencies:
    | {
        id: string
        decimals: number
        symbol: string
        approved: boolean
      }[]
    | undefined
}

const CartDrawer: FC<Props> = ({ isOpen, onClose }) => {
  const { events } = useRouter()
  const { CHAINS } = useEnvironment()
  const { clearCart, items } = useCart()
  const [step, setStep] = useState<
    'selection' | 'transaction' | 'success' | 'error'
  >('selection')
  const formValues = useForm<FormData>()
  const selectedChainId = formValues.watch('chainId')
  const currencies = formValues.watch('currencies')

  const [fetch, { data }] = useFetchCartItemsLazyQuery({
    variables: {
      offerIds: items.map((item) => item.offerId),
    },
  })

  const cartItems = useOrderByKey(
    items.map((item) => item.offerId),
    data?.offerOpenSales?.nodes,
    (asset) => asset.id,
  )

  const uniqueCartChains = useMemo(() => {
    const chains: { id: number; name: string; image: string }[] = []
    cartItems?.forEach((item) => {
      const chain = CHAINS.find((chain) => chain.id === item.asset.chainId)
      chain &&
        !chains.some((item) => item.id === chain.id) &&
        chains.push({
          id: chain.id,
          name: chain.name,
          image: `/chains/${chain.id}.svg`,
        })
    })
    return chains
  }, [CHAINS, cartItems])

  const selectedChain = useMemo(
    () => uniqueCartChains?.find((chain) => chain.id === selectedChainId),
    [selectedChainId, uniqueCartChains],
  )

  const content = useMemo(() => {
    switch (step) {
      case 'selection':
        return (
          <List>
            {!cartItems ? (
              new Array(items.length > 0 ? items.length : 4)
                .fill(0)
                .map((_, index) => (
                  <ListItem
                    key={index}
                    image={<SkeletonCircle size="10" borderRadius="xl" />}
                    imageRounded="xl"
                    label={<SkeletonText noOfLines={2} width="24" />}
                    action={<SkeletonText noOfLines={1} width="24" />}
                  />
                ))
            ) : cartItems.length > 0 ? (
              <CartSelectionStep
                cartItems={cartItems}
                chains={uniqueCartChains}
              />
            ) : (
              <VStack spacing={1} py={4}>
                <Text variant="subtitle2" color="gray.800">
                  No items in cart
                </Text>
                <Text variant="caption">Add items to get started.</Text>
                <Button
                  size="sm"
                  as={Link}
                  href="/explore?offers=fixed"
                  variant="outline"
                  mt={3}
                >
                  Explore NFTs
                </Button>
              </VStack>
            )}
          </List>
        )
      case 'transaction':
        invariant(cartItems, 'Cart items must be defined')
        invariant(selectedChain, 'Selected chain must be defined')
        return (
          <CartTransactionStep
            cartItems={cartItems.filter(
              (cartItem) => cartItem.asset.chainId === selectedChain.id,
            )}
            chain={selectedChain}
          />
        )
      case 'success':
        invariant(selectedChain, 'Selected chain must be defined')
        return <CartSuccessStep chainId={selectedChain.id} transactionHash="" />
      case 'error':
        return <CartErrorStep />
    }
  }, [cartItems, items.length, selectedChain, step, uniqueCartChains])

  const onSubmit = formValues.handleSubmit((data) => {
    // TODO: do the transaction (This will be next callback when all the currencies are approved)
    console.log(data.chainId)
    setStep('success')
  })

  const button = useMemo(() => {
    switch (step) {
      case 'selection':
        return (
          <CartSelectionStepButton
            chain={selectedChain}
            isDisabled={cartItems?.length === 0}
            onClick={() => setStep('transaction')}
          />
        )
      case 'transaction':
        return (
          <CartTransactionStepButton
            currencies={currencies}
            onBack={() => setStep('selection')}
            onSubmit={onSubmit}
          />
        )
      case 'success':
        return (
          <Button onClick={() => setStep('selection')} width="full">
            Back to cart
          </Button>
        )
      case 'error':
        return (
          <Button onClick={() => setStep('transaction')} width="full">
            Try again
          </Button>
        )
    }
  }, [cartItems, currencies, onSubmit, selectedChain, step])

  useEffect(() => {
    async function fetchCartItems() {
      isOpen && setStep('selection')
      isOpen && (await fetch())
    }
    void fetchCartItems()
  }, [fetch, isOpen])

  useEffect(() => {
    events.on('routeChangeStart', () => onClose())
    return () => {
      events.off('routeChangeStart', () => onClose())
    }
  }, [events, onClose])

  useEffect(() => {
    if (
      selectedChainId === undefined &&
      uniqueCartChains &&
      uniqueCartChains[0]
    ) {
      formValues.setValue('chainId', uniqueCartChains[0].id)
    }
  }, [formValues, selectedChainId, uniqueCartChains])

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      size={{ base: 'full', sm: 'xs' }}
    >
      <DrawerOverlay />
      <DrawerContent
        mt={{ base: 0, sm: 16 }}
        mb={{ base: 0, sm: 4 }}
        mx={{ base: 0, sm: 4 }}
        borderRadius={{ base: 'none', sm: 'xl' }}
      >
        <DrawerHeader px={4}>
          <Flex alignItems="center" justifyContent="space-between">
            <HStack spacing={1}>
              <span>Cart</span>
              <Tag size="sm" colorScheme="brand" variant="solid">
                {items.length}
              </Tag>
            </HStack>
            <HStack spacing={1}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  clearCart()
                  setStep('selection')
                }}
              >
                Clear all
              </Button>
              <CloseButton onClick={onClose} />
            </HStack>
          </Flex>
        </DrawerHeader>
        <Divider />
        <DrawerBody py={4} px={2}>
          <FormProvider {...formValues}>
            <Box as="form" id="cart-form" onSubmit={onSubmit} height="full">
              {content}
            </Box>
          </FormProvider>
        </DrawerBody>
        <Divider />
        <DrawerFooter>{button}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default CartDrawer
