import {
  Button,
  CloseButton,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Tag,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'
import { useFetchCartItemsLazyQuery } from '../../graphql'
import useCart from '../../hooks/useCart'
import { useOrderByKey } from '../../hooks/useOrderByKey'
import Link from '../Link/Link'
import List from '../List/List'
import CartDrawerListItem from '../Navbar/CartDrawerListItem'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const CartDrawer: FC<Props> = ({ isOpen, onClose }) => {
  const { events } = useRouter()
  const { clearCart, items } = useCart()
  const [fetch, { data }] = useFetchCartItemsLazyQuery({
    variables: {
      offerIds: items.map((item) => item.offerId),
    },
  })

  const cartItems = useOrderByKey(
    items.map((item) => item.offerId),
    data?.offerOpenSales?.nodes,
    (asset) => asset.id,
  )

  useEffect(() => {
    async function fetchCartItems() {
      isOpen && (await fetch())
    }
    void fetchCartItems()
  }, [fetch, isOpen])

  useEffect(() => {
    events.on('routeChangeStart', () => onClose())
    return () => {
      events.off('routeChangeStart', () => onClose())
    }
  }, [events, onClose])

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right">
      <DrawerOverlay />
      <DrawerContent mt={16} mb={4} mx={4} borderRadius="xl">
        <DrawerHeader px={4}>
          <Flex alignItems="center" justifyContent="space-between">
            <HStack spacing={1}>
              <span>Cart</span>
              <Tag size="sm" colorScheme="brand" variant="solid">
                {items.length}
              </Tag>
            </HStack>
            <HStack spacing={1}>
              <Button size="sm" variant="ghost" onClick={clearCart}>
                Clear all
              </Button>
              <CloseButton onClick={onClose} />
            </HStack>
          </Flex>
        </DrawerHeader>
        <Divider />
        <DrawerBody py={4} px={2}>
          <List>
            {cartItems?.map((cartItem) => (
              <CartDrawerListItem key={cartItem.id} cartItem={cartItem} />
            ))}
          </List>
        </DrawerBody>
        <Divider />
        <DrawerFooter>
          <Button as={Link} href="/cart" width="full">
            Checkout
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default CartDrawer
