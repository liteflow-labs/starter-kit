import { sendTransaction } from '@liteflow/core/dist/utils/transaction'
import { BigNumber } from 'ethers'
import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import invariant from 'ts-invariant'
import { useCreateCartPurchaseTransactionMutation } from '../graphql'
import useAccount from '../hooks/useAccount'
import { CartItem, CartContext as Context } from '../hooks/useCart'
import useSigner from '../hooks/useSigner'

const CartContext: FC<PropsWithChildren> = (props) => {
  const [items, setItems] = useState<CartItem[]>()
  const { address } = useAccount()
  const signer = useSigner()
  const [fetchCartTransaction] = useCreateCartPurchaseTransactionMutation()
  const [onCheckoutCallbacks, setOnCheckoutCallbacks] = useState<
    (() => void)[]
  >([])

  const registerOnCheckout = useCallback((callback: () => void) => {
    setOnCheckoutCallbacks((prev) => [...prev, callback])
  }, [])

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

  const checkout = useCallback(
    async (items: CartItem[]) => {
      invariant(address)
      invariant(signer)
      const res = await fetchCartTransaction({
        variables: {
          accountAddress: address,
          items: items.map((x) => ({
            offerId: x.offerId,
            fillQuantity: BigNumber.from(x.quantity || 1).toString(),
          })),
        },
      })
      invariant(res.data)
      const tx = res.data.createCheckoutTransaction.transaction as any
      invariant(tx)
      const transaction = await sendTransaction(signer, tx)
      const receipt = await transaction.wait()
      for (const item of items) removeItem(item.offerId) // cleanup items in the cart
      // TODO: check ownership change or any better way to know that the backend is synchronized
      // temporary solution: wait 1 second before calling the callbacks
      setTimeout(
        () => onCheckoutCallbacks.forEach((callback) => callback()),
        1000,
      )
      return receipt
    },
    [address, fetchCartTransaction, signer, removeItem, onCheckoutCallbacks],
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
        checkout,
        registerOnCheckout,
      }}
      {...props}
    />
  )
}

export default CartContext
