import {
  Button,
  CloseButton,
  Divider,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Tag,
} from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import useCart, { CartItem } from '../../hooks/useCart'
import CartStepError from './Step/Error'
import CartStepSelection from './Step/Selection'
import CartStepSuccess from './Step/Success'
import CartStepTransaction from './Step/Transaction'

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
  const { clearCart, items } = useCart()
  const [chainId, setChainId] = useState<number>()
  const [selectedItems, setSelectedItems] = useState<CartItem[]>()
  const [showSuccess, setShowSuccess] = useState<boolean>()
  const [error, setError] = useState<Error>()

  const reset = useCallback(() => {
    setChainId(undefined)
    setSelectedItems(undefined)
    setShowSuccess(false)
    setError(undefined)
  }, [])

  const content = useMemo(() => {
    if (error)
      return <CartStepError error={error} onBack={() => setError(undefined)} />
    if (chainId && showSuccess)
      return <CartStepSuccess chainId={chainId} onBack={reset} />

    if (chainId && selectedItems)
      return (
        <CartStepTransaction
          cartItems={selectedItems}
          chainId={chainId}
          onSubmit={() => setShowSuccess(true)}
          onCancel={reset}
          onError={setError}
        />
      )
    return (
      <CartStepSelection
        onSubmit={({ chainId, items }) => {
          setChainId(chainId)
          setSelectedItems(items)
        }}
      />
    )
  }, [chainId, error, showSuccess, selectedItems, reset])

  useEffect(() => {
    if (isOpen) return
    reset()
  }, [isOpen, reset])

  useEffect(() => {
    events.on('routeChangeStart', () => onClose())
    return () => {
      events.off('routeChangeStart', () => onClose())
    }
  }, [events, onClose])

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" variant="cart">
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
                  reset()
                }}
              >
                {t('cart.drawer.clear-all')}
              </Button>
              <CloseButton onClick={onClose} />
            </HStack>
          </Flex>
        </DrawerHeader>
        <Divider />
        {content}
      </DrawerContent>
    </Drawer>
  )
}

export default CartDrawer
