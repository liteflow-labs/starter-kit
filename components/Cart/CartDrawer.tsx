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
  Tag,
} from '@chakra-ui/react'
import CartErrorStep from 'components/Cart/Step/Error'
import CartSelectionStep from 'components/Cart/Step/Selection'
import CartSuccessStep from 'components/Cart/Step/Success'
import CartTransactionStep from 'components/Cart/Step/Transaction'
import CartTransactionStepButton from 'components/Cart/Step/TransactionButton'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { FC, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import invariant from 'ts-invariant'
import { dateIsBefore } from 'utils'
import { useFetchCartItemsQuery } from '../../graphql'
import useCart from '../../hooks/useCart'
import useEnvironment from '../../hooks/useEnvironment'
import useNow from '../../hooks/useNow'
import { useOrderByKey } from '../../hooks/useOrderByKey'
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
  const { t } = useTranslation('components')
  const { events } = useRouter()
  const { CHAINS } = useEnvironment()
  const now = useNow()
  const { clearCart, items } = useCart()
  const [step, setStep] = useState<
    'selection' | 'transaction' | 'success' | 'error'
  >('selection')
  const formValues = useForm<FormData>()
  const selectedChainId = formValues.watch('chainId')
  const currencies = formValues.watch('currencies')
  const offerIds = useMemo(() => items.map((item) => item.offerId), [items])

  const { data } = useFetchCartItemsQuery({
    variables: { offerIds },
  })

  const cartItems = useOrderByKey(
    offerIds,
    data?.offerOpenSales?.nodes,
    (asset) => asset.id,
  )

  const uniqueCartChains = useMemo(
    () =>
      cartItems
        ?.map((cartItem) => cartItem.asset.chainId)
        .filter((chainId, index, array) => array.indexOf(chainId) === index)
        .map((chainId) => CHAINS.find((chain) => chain.id === chainId))
        .filter(Boolean)
        .map((chain) => ({
          id: chain.id,
          name: chain.name,
          image: `/chains/${chain.id}.svg`,
        })) || [],
    [cartItems, CHAINS],
  )

  const selectedChain = useMemo(
    () => uniqueCartChains.find((chain) => chain.id === selectedChainId),
    [selectedChainId, uniqueCartChains],
  )

  const nonExpiredSelectedCartItems = useMemo(() => {
    return cartItems
      ?.filter((x) => x.asset.chainId === selectedChain?.id)
      .filter((item) => dateIsBefore(now, item.expiredAt))
  }, [cartItems, now, selectedChain?.id])

  const content = useMemo(() => {
    switch (step) {
      case 'selection':
        return (
          <CartSelectionStep cartItems={cartItems} chains={uniqueCartChains} />
        )
      case 'transaction':
        invariant(
          nonExpiredSelectedCartItems,
          'Non expired cart items must be defined',
        )
        invariant(selectedChain, 'Selected chain must be defined')
        return (
          <CartTransactionStep
            cartItems={nonExpiredSelectedCartItems}
            chain={selectedChain}
          />
        )
      case 'success':
        invariant(selectedChain, 'Selected chain must be defined')
        return <CartSuccessStep chainId={selectedChain.id} transactionHash="" />
      case 'error':
        return <CartErrorStep />
    }
  }, [
    cartItems,
    nonExpiredSelectedCartItems,
    selectedChain,
    step,
    uniqueCartChains,
  ])

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
        return nonExpiredSelectedCartItems?.length === 0 ? (
          <Button onClick={() => setStep('selection')} width="full">
            {t('cart.drawer.back')}
          </Button>
        ) : (
          <CartTransactionStepButton
            currencies={currencies}
            onBack={() => setStep('selection')}
            onSubmit={onSubmit}
          />
        )
      case 'success':
        return (
          <Button onClick={() => setStep('selection')} width="full">
            {t('cart.drawer.back')}
          </Button>
        )
      case 'error':
        return (
          <Button onClick={() => setStep('transaction')} width="full">
            {t('cart.drawer.error')}
          </Button>
        )
    }
  }, [
    cartItems?.length,
    currencies,
    nonExpiredSelectedCartItems?.length,
    onSubmit,
    selectedChain,
    step,
    t,
  ])

  useEffect(() => {
    events.on('routeChangeStart', () => onClose())
    return () => {
      events.off('routeChangeStart', () => onClose())
    }
  }, [events, onClose])

  useEffect(() => {
    if (!selectedChain && uniqueCartChains && uniqueCartChains[0]) {
      formValues.setValue('chainId', uniqueCartChains[0].id)
    }
  }, [formValues, selectedChain, uniqueCartChains])

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
              <span>{t('cart.drawer.title')}</span>
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
                {t('cart.drawer.clear-all')}
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
