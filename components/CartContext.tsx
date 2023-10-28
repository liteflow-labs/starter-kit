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

  // TODO: add fetch when we add first item to the list so we get the chainId for that item
  // and share that chainId with context so we can block adding items from different chains
  // no need to do this multiple times, just once when we add first item and clear it when we clear cart

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
