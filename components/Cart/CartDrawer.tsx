import {
  Box,
  Button,
  Checkbox,
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
  Icon,
  IconButton,
  SkeletonCircle,
  SkeletonText,
  Tag,
  Text,
  VStack,
  useRadioGroup,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { FaAngleRight } from '@react-icons/all-files/fa/FaAngleRight'
import Image from 'components/Image/Image'
import { useRouter } from 'next/router'
import { FC, useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useFetchCartItemsLazyQuery } from '../../graphql'
import useCart from '../../hooks/useCart'
import useEnvironment from '../../hooks/useEnvironment'
import { useOrderByKey } from '../../hooks/useOrderByKey'
import Link from '../Link/Link'
import List, { ListItem } from '../List/List'
import CartDrawerListItem from './CartDrawerListItem'
import CartRadio from './CartRadio'

type Props = {
  isOpen: boolean
  onClose: () => void
}

type FormData = {
  chainId: number
}

const CartDrawer: FC<Props> = ({ isOpen, onClose }) => {
  const { events } = useRouter()
  const { CHAINS } = useEnvironment()
  const { clearCart, items } = useCart()
  const formValues = useForm<FormData>()
  const { getRadioProps, getRootProps } = useRadioGroup({
    name: 'chainId',
    defaultValue: undefined,
    onChange: (e) =>
      formValues.setValue('chainId', BigNumber.from(e).toNumber()),
  })
  const selectedChainId = formValues.watch('chainId')

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

  const uniqueCartChains = useMemo(() => {
    const chains: { id: number; name: string; image: string }[] = []
    cartItems?.forEach((item) => {
      const chain = CHAINS.find((chain) => chain.id === item.asset.chainId)
      chain &&
        !chains.some((item) => item.id === chain.id) &&
        chains.push({
          id: chain.id,
          name: chain.name,
          image: `/chains/${chain.id}.svg`,
        })
    })
    return chains
  }, [CHAINS, cartItems])

  const selectedChain = useMemo(
    () => uniqueCartChains?.find((chain) => chain.id === selectedChainId),
    [selectedChainId, uniqueCartChains],
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

  useEffect(() => {
    if (
      selectedChainId === undefined &&
      uniqueCartChains &&
      uniqueCartChains[0]
    ) {
      formValues.setValue('chainId', uniqueCartChains[0].id)
    }
  }, [formValues, selectedChainId, uniqueCartChains])

  const onSubmit = formValues.handleSubmit((data) => {
    console.log(data.chainId)
  })

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
              <FormProvider {...formValues}>
                <Box as="form" onSubmit={onSubmit}>
                  <VStack
                    alignItems="flex-start"
                    width="full"
                    {...getRootProps()}
                  >
                    {uniqueCartChains.map((chain, i) => {
                      const radio = getRadioProps({ value: chain.id })
                      return (
                        <CartRadio
                          key={i}
                          {...radio}
                          isChecked={chain.id === formValues.watch('chainId')}
                        >
                          <HStack gap={1}>
                            <Checkbox
                              isChecked={
                                chain.id === formValues.watch('chainId')
                              }
                              width="auto"
                              _checked={{ backgroundColor: 'transparent' }}
                              _hover={{ backgroundColor: 'transparent' }}
                            />
                            <Text variant="subtitle2">{chain.name}</Text>
                          </HStack>
                          {cartItems
                            .filter((item) => item.asset.chainId === chain.id)
                            .map((cartItem) => (
                              <CartDrawerListItem
                                key={cartItem.id}
                                cartItem={cartItem}
                              />
                            ))}
                        </CartRadio>
                      )
                    })}
                  </VStack>
                </Box>
              </FormProvider>
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
          <HStack gap={0} width="full">
            <Button
              isDisabled={cartItems?.length === 0}
              flexGrow={1}
              borderRightRadius="none"
            >
              Continue with
              {selectedChain && (
                <Image
                  src={selectedChain.image}
                  alt={selectedChain.name}
                  width={16}
                  height={16}
                  h={4}
                  w={4}
                  ml={1}
                />
              )}
            </Button>
            <Divider orientation="vertical" />
            <IconButton
              aria-label="Continue"
              icon={<Icon as={FaAngleRight} boxSize={5} />}
              isDisabled={cartItems?.length === 0}
              borderLeftRadius="none"
            />
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default CartDrawer
