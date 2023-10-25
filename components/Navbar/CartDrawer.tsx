import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'
import { CartItem } from '../../hooks/useCart'

type Props = {
  items: CartItem[]
  isOpen: boolean
  onClose: () => void
}

const CartDrawer: FC<Props> = ({ items, isOpen, onClose }) => {
  const { events } = useRouter()

  useEffect(() => {
    events.on('routeChangeStart', () => onClose())
    return () => {
      events.off('routeChangeStart', () => onClose())
    }
  }, [events, onClose])

  console.log(items)
  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right">
      <DrawerOverlay />
      <DrawerContent top="64px !important" bottom="16px !important">
        <DrawerCloseButton />
        <DrawerHeader>{items.length}</DrawerHeader>
        <DrawerBody px={0} mt={8}>
          hello
        </DrawerBody>
        <DrawerFooter>bye</DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default CartDrawer
