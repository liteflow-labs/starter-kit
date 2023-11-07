import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import useAccount from '../hooks/useAccount'
import { CartItem, CartContext as Context } from '../hooks/useCart'

const CartContext: FC<PropsWithChildren> = (props) => {
  const [items, setItems] = useState<CartItem[]>()
  const { address } = useAccount()

  const addItem = useCallback(
    (item: CartItem) => {
      setItems([...(items || []), item])
    },
    [items],
  )
  const removeItem = useCallback((id: UUID) => {
    setItems((prev) => (prev || []).filter((x) => x.offerId !== id))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const hasItem = useCallback(
    (id: UUID) => (items || []).some((x) => x.offerId === id),
    [items],
  )

  useEffect(() => {
    if (!address) return
    setItems(
      JSON.parse(localStorage.getItem(`liteflow.cart.${address}`) || '[]'),
    )
  }, [address])

  useEffect(() => {
    if (!items) return
    if (!address) return
    localStorage.setItem(`liteflow.cart.${address}`, JSON.stringify(items))
  }, [items, address])

  return (
    <Context.Provider
      value={{
        items: items || [],
        addItem,
        hasItem,
        removeItem,
        clearCart,
      }}
      {...props}
    />
  )
}

export default CartContext
