import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { FaInfoCircle } from '@react-icons/all-files/fa/FaInfoCircle'
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
        <DrawerCloseButton top={4} />
        <DrawerHeader px={4}>
          <HStack>
            <span>Your cart</span>
            <Tooltip
              label="Items in your cart are not guaranteed at the time of checkout."
              placement="bottom"
              p={3}
            >
              <span>
                <Icon
                  as={FaInfoCircle}
                  color="gray.400"
                  h={4}
                  w={4}
                  cursor="pointer"
                />
              </span>
            </Tooltip>
          </HStack>
        </DrawerHeader>
        <Divider />
        <Flex px={4} py={3} alignItems="center" justifyContent="space-between">
          <Text>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Text>
          <Button size="sm" variant="ghost" onClick={clearCart}>
            Clear all
          </Button>
        </Flex>
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
