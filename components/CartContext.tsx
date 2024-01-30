import { useBatchPurchase } from '@liteflow/react'
import { BigNumber } from 'ethers'
import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import useAccount from '../hooks/useAccount'
import { CartItem, CartContext as Context } from '../hooks/useCart'
import useSigner from '../hooks/useSigner'

const CartContext: FC<PropsWithChildren> = (props) => {
  const [items, setItems] = useState<CartItem[]>()
  const { address } = useAccount()
  const signer = useSigner()
  const [transactionHash, setTransactionHash] = useState<string>()
  const [batchPurchase, { transactionHash: txHash, activeStep }] =
    useBatchPurchase(signer)
  const [onCheckoutCallbacks, setOnCheckoutCallbacks] = useState<
    (() => void)[]
  >([])

  useEffect(() => {
    if (!txHash) return
    setTransactionHash(txHash)
  }, [txHash])

  const registerOnCheckout = useCallback((callback: () => void) => {
    setOnCheckoutCallbacks((prev) => [
      ...prev.filter((x) => x !== callback),
      callback,
    ])
  }, [])

  const unregisterOnCheckout = useCallback((callback: () => void) => {
    setOnCheckoutCallbacks((prev) => prev.filter((x) => x !== callback))
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
      await batchPurchase(
        items.map((x) => ({
          offerId: x.offerId,
          quantity: BigNumber.from(x.quantity || 1).toString(),
        })),
      )
      for (const item of items) removeItem(item.offerId) // cleanup items in the cart
      onCheckoutCallbacks.map((callback) => callback())
    },
    [batchPurchase, removeItem, onCheckoutCallbacks],
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
        activeStep,
        transactionHash,
        registerOnCheckout,
        unregisterOnCheckout,
      }}
      {...props}
    />
  )
}

export default CartContext
