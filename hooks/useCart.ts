import { ContractReceipt } from 'ethers'
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
  checkout: (items: CartItem[]) => Promise<ContractReceipt>
  registerOnCheckout: (callback: () => void) => void
}

export const CartContext = createContext<CartContext>({} as CartContext)

export default function useCart({
  onCheckout,
}: {
  onCheckout?: () => void
} = {}): Omit<CartContext, 'registerOnCheckout'> {
  const { registerOnCheckout, ...context } = useContext(CartContext)

  useEffect(() => {
    if (!onCheckout) return
    registerOnCheckout(onCheckout)
  }, [onCheckout, registerOnCheckout])

  return context
}
