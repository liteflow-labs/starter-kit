import { Button, ButtonProps } from '@chakra-ui/react'
import { FaShoppingBag } from '@react-icons/all-files/fa/FaShoppingBag'
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
  const { addItem, hasItem, removeItem } = useCart()

  const addOrRemoveFromCart = useCallback(async () => {
    if (hasItem(offerId)) {
      removeItem(offerId)
    } else {
      addItem({ offerId })
    }
  }, [offerId, hasItem, addItem, removeItem])

  return (
    <Button
      {...props}
      onClick={addOrRemoveFromCart}
      icon={hasItem(offerId) ? <FaShoppingBag /> : <FaShoppingCart />}
    />
  )
}
