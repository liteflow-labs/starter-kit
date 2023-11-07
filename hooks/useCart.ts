import { createContext, useContext } from 'react'

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
}

export const CartContext = createContext<CartContext>({} as CartContext)

export default function useCart(): CartContext {
  return useContext(CartContext)
}
