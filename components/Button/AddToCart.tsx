import { ButtonProps, IconButton, useToast } from '@chakra-ui/react'
import { FaMinus } from '@react-icons/all-files/fa/FaMinus'
import { FaShoppingCart } from '@react-icons/all-files/fa/FaShoppingCart'
import { JSX, PropsWithChildren, useCallback } from 'react'
import useCart from '../../hooks/useCart'

type Props = Omit<ButtonProps, 'onClick'> & {
  offerId: string
}

export default function AddToCartButton({
  offerId,
  children,
  ...props
}: PropsWithChildren<Props>): JSX.Element {
  const toast = useToast()
  const { addItem, hasItem, removeItem } = useCart()

  const addOrRemoveFromCart = useCallback(async () => {
    if (hasItem(offerId)) {
      removeItem(offerId)
      toast({
        title: 'Removed from cart',
        status: 'success',
        duration: 1500,
      })
    } else {
      addItem({ offerId })
      toast({
        title: 'Added to cart',
        status: 'success',
        duration: 1500,
      })
    }
  }, [addItem, hasItem, offerId, removeItem, toast])

  return (
    <IconButton
      {...props}
      aria-label={hasItem(offerId) ? 'Remove from cart' : 'Add to cart'}
      onClick={addOrRemoveFromCart}
      icon={hasItem(offerId) ? <FaMinus /> : <FaShoppingCart />}
    />
  )
}
