import {
  Button,
  Checkbox,
  HStack,
  SkeletonCircle,
  SkeletonText,
  Text,
  VStack,
  useRadioGroup,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { FC } from 'react'
import { useFormContext } from 'react-hook-form'
import { FetchCartItemsQuery } from '../../../graphql'
import useCart from '../../../hooks/useCart'
import Link from '../../Link/Link'
import List, { ListItem } from '../../List/List'
import CartDrawerListItem from '../CartDrawerListItem'
import CartRadio from '../CartRadio'

type Props = {
  cartItems:
    | NonNullable<FetchCartItemsQuery['offerOpenSales']>['nodes']
    | undefined
  chains: { id: number; name: string; image: string }[]
}

const CartSelectionStep: FC<Props> = ({ cartItems, chains }) => {
  const { setValue, watch } = useFormContext()
  const { items } = useCart()
  const { getRadioProps, getRootProps } = useRadioGroup({
    name: 'chainId',
    defaultValue: undefined,
    onChange: (e) => setValue('chainId', BigNumber.from(e).toNumber()),
  })
  const chainId = watch('chainId')
  if (!cartItems) {
    return (
      <List>
        {new Array(items.length > 0 ? items.length : 4)
          .fill(0)
          .map((_, index) => (
            <ListItem
              key={index}
              image={<SkeletonCircle size="10" borderRadius="xl" />}
              imageRounded="xl"
              label={<SkeletonText noOfLines={2} width="24" />}
              action={<SkeletonText noOfLines={1} width="24" />}
            />
          ))}
      </List>
    )
  }
  if (cartItems.length === 0) {
    return (
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
    )
  }
  return (
    <VStack alignItems="flex-start" width="full" {...getRootProps()}>
      {chains.map((chain, i) => {
        const radio = getRadioProps({ value: chain.id })
        return (
          <CartRadio key={i} {...radio} isChecked={chain.id === chainId}>
            <HStack gap={1}>
              <Checkbox
                isChecked={chain.id === chainId}
                width="auto"
                _checked={{ backgroundColor: 'transparent' }}
                _hover={{ backgroundColor: 'transparent' }}
              />
              <Text variant="subtitle2">{chain.name}</Text>
            </HStack>
            {cartItems
              .filter((item) => item.asset.chainId === chain.id)
              .map((cartItem) => (
                <CartDrawerListItem key={cartItem.id} cartItem={cartItem} />
              ))}
          </CartRadio>
        )
      })}
    </VStack>
  )
}

export default CartSelectionStep
