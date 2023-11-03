import { Checkbox, HStack, Text, VStack, useRadioGroup } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { FC } from 'react'
import { useFormContext } from 'react-hook-form'
import { FetchCartItemsQuery } from '../../../graphql'
import CartDrawerListItem from '../CartDrawerListItem'
import CartRadio from '../CartRadio'

type Props = {
  cartItems: NonNullable<FetchCartItemsQuery['offerOpenSales']>['nodes']
  chains: { id: number; name: string; image: string }[]
}

const CartSelectionStep: FC<Props> = ({ cartItems, chains }) => {
  const { setValue, watch } = useFormContext()
  const { getRadioProps, getRootProps } = useRadioGroup({
    name: 'chainId',
    defaultValue: undefined,
    onChange: (e) => setValue('chainId', BigNumber.from(e).toNumber()),
  })
  const chainId = watch('chainId')
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
