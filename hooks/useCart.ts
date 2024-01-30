import { BatchPurchaseStep } from '@liteflow/react/dist/useBatchPurchase'
import { createContext, useContext, useEffect } from 'react'

export type CartItem = {
  offerId: UUID
  quantity?: number
}

type CartContext = {
  addItem: (item: CartItem) => void
  removeItem: (id: UUID) => void
  hasItem: (id: UUID) => boolean
  clearCart: () => void
  items: CartItem[]
  checkout: (items: CartItem[]) => Promise<void>
  activeStep: BatchPurchaseStep
  transactionHash: string | undefined
  registerOnCheckout: (callback: () => void) => void
  unregisterOnCheckout: (callback: () => void) => void
}

export const CartContext = createContext<CartContext>({} as CartContext)

export default function useCart({
  onCheckout,
}: {
  onCheckout?: () => void
} = {}): Omit<CartContext, 'registerOnCheckout' | 'unregisterOnCheckout'> {
  const { registerOnCheckout, unregisterOnCheckout, ...context } =
    useContext(CartContext)

  useEffect(() => {
    if (!onCheckout) return
    registerOnCheckout(onCheckout)
    return () => unregisterOnCheckout(onCheckout)
  }, [onCheckout, registerOnCheckout, unregisterOnCheckout])

  return context
}
