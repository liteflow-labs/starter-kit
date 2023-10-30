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
  SkeletonCircle,
  SkeletonText,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'
import { useFetchCartItemsLazyQuery } from '../../graphql'
import useCart from '../../hooks/useCart'
import { useOrderByKey } from '../../hooks/useOrderByKey'
import Link from '../Link/Link'
import List, { ListItem } from '../List/List'
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
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      size={{ base: 'full', sm: 'xs' }}
    >
      <DrawerOverlay />
      <DrawerContent
        mt={{ base: 0, sm: 16 }}
        mb={{ base: 0, sm: 4 }}
        mx={{ base: 0, sm: 4 }}
        borderRadius={{ base: 'none', sm: 'xl' }}
      >
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
            {!cartItems ? (
              new Array(items.length > 0 ? items.length : 4)
                .fill(0)
                .map((_, index) => (
                  <ListItem
                    key={index}
                    image={<SkeletonCircle size="10" borderRadius="xl" />}
                    imageRounded="xl"
                    label={<SkeletonText noOfLines={2} width="24" />}
                    action={<SkeletonText noOfLines={1} width="24" />}
                  />
                ))
            ) : cartItems.length > 0 ? (
              cartItems.map((cartItem) => (
                <CartDrawerListItem key={cartItem.id} cartItem={cartItem} />
              ))
            ) : (
              <VStack spacing={1} py={4}>
                <Text variant="subtitle2" color="gray.800">
                  No items in cart
                </Text>
                <Text variant="caption">Add items to get started.</Text>
                <Button
                  size="sm"
                  as={Link}
                  href="/explore?offers=fixed"
                  variant="outline"
                  mt={3}
                >
                  Explore NFTs
                </Button>
              </VStack>
            )}
          </List>
        </DrawerBody>
        <Divider />
        <DrawerFooter>
          <Button
            as={Link}
            href="/cart"
            width="full"
            isDisabled={cartItems?.length === 0}
          >
            Checkout
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default CartDrawer
