import { ButtonProps, IconButton, useToast } from '@chakra-ui/react'
import { MdRemoveShoppingCart } from '@react-icons/all-files/md/MdRemoveShoppingCart'
import { MdShoppingCart } from '@react-icons/all-files/md/MdShoppingCart'
import useTranslation from 'next-translate/useTranslation'
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
  const { t } = useTranslation('components')
  const toast = useToast()
  const { addItem, hasItem, removeItem } = useCart()

  const addOrRemoveFromCart = useCallback(async () => {
    if (hasItem(offerId)) {
      removeItem(offerId)
      toast({
        title: t('cart.add-to-cart.toast.remove'),
        status: 'success',
        duration: 1500,
      })
    } else {
      addItem({ offerId })
      toast({
        title: t('cart.add-to-cart.toast.add'),
        status: 'success',
        duration: 1500,
      })
    }
  }, [addItem, hasItem, offerId, removeItem, toast, t])

  return (
    <IconButton
      {...props}
      aria-label={
        hasItem(offerId)
          ? t('cart.add-to-cart.button.remove')
          : t('cart.add-to-cart.button.add')
      }
      onClick={addOrRemoveFromCart}
      icon={hasItem(offerId) ? <MdRemoveShoppingCart /> : <MdShoppingCart />}
    />
  )
}
