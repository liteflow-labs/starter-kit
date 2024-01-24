import {
  Button,
  Divider,
  DrawerBody,
  DrawerFooter,
  HStack,
  Radio,
  SkeletonCircle,
  SkeletonText,
  Text,
  VStack,
  useRadioGroup,
} from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import invariant from 'ts-invariant'
import { FetchCartItemsQuery, useFetchCartItemsQuery } from '../../../graphql'
import useCart, { CartItem } from '../../../hooks/useCart'
import useEnvironment from '../../../hooks/useEnvironment'
import useNow from '../../../hooks/useNow'
import { dateIsBefore } from '../../../utils'
import Link from '../../Link/Link'
import List, { ListItem } from '../../List/List'
import CartDrawerListItem from '../CartDrawerListItem'
import CartRadio from '../CartRadio'

type FormData = {
  chainId: number
}

type Props = {
  onSubmit: (data: { chainId: number; items: CartItem[] }) => void
}

const CartStepSelection: FC<Props> = ({ onSubmit }) => {
  const { t } = useTranslation('components')
  const { CHAINS } = useEnvironment()
  const { items } = useCart()
  const now = useNow()
  const { watch, setValue, handleSubmit } = useForm<FormData>()
  const chainId = watch('chainId')
  const { getRadioProps, getRootProps } = useRadioGroup({
    name: 'chainId',
    defaultValue: undefined,
    onChange: (e) => setValue('chainId', parseInt(e, 10)),
  })

  const offerIds = useMemo(() => items.map((item) => item.offerId), [items])
  const { data, loading } = useFetchCartItemsQuery({
    variables: { offerIds },
  })

  const offers = useMemo(
    () =>
      (data?.offerOpenSales?.nodes || []).reduce(
        (prev, x) => ({ ...prev, [x.id]: x }),
        {} as Record<
          string,
          NonNullable<FetchCartItemsQuery['offerOpenSales']>['nodes'][number]
        >,
      ),
    [data?.offerOpenSales?.nodes],
  )

  const nonExpiredSelectedCartItems = useMemo(
    () =>
      items?.filter((item) => {
        const offer = offers[item.offerId]
        if (!offer) return false
        return (
          offer.asset.chainId === chainId && dateIsBefore(now, offer.expiredAt)
        )
      }),
    [items, offers, now, chainId],
  )
  const uniqueCartChains = useMemo(
    () =>
      Object.keys(offers)
        ?.map((id) => offers[id]?.asset.chainId)
        .filter((chainId, index, array) => array.indexOf(chainId) === index)
        .map((chainId) => CHAINS.find((chain) => chain.id === chainId))
        .filter(Boolean)
        .map((chain) => ({
          id: chain.id,
          name: chain.name,
          image: `/chains/${chain.id}.svg`,
        })) || [],
    [offers, CHAINS],
  )

  const itemsWithOffers = useMemo(() => {
    return items
      .map((item) => {
        const offer = offers[item.offerId]
        if (!offer) return
        return {
          ...item,
          offer,
          valid: dateIsBefore(now, offer.expiredAt),
        }
      })
      .filter(Boolean)
  }, [items, offers, now])

  const itemsWithOffersByChain = useMemo(() => {
    return itemsWithOffers.reduce(
      (prev, item) => {
        const chainId = item.offer.asset.chainId
        return {
          ...prev,
          [chainId]: [...(prev[chainId] || []), item],
        }
      },
      {} as Record<number, typeof itemsWithOffers>,
    )
  }, [itemsWithOffers])

  const selectedChain = useMemo(
    () => uniqueCartChains.find((chain) => chain.id === chainId),
    [chainId, uniqueCartChains],
  )

  const submit = handleSubmit((data) => {
    if (!nonExpiredSelectedCartItems) return
    if (nonExpiredSelectedCartItems.length === 0) return
    onSubmit({
      chainId: data.chainId,
      items: nonExpiredSelectedCartItems || [],
    })
  })

  useEffect(() => {
    if (uniqueCartChains.length !== 1) return
    const chain = uniqueCartChains[0]
    invariant(chain)
    setValue('chainId', chain.id)
  }, [uniqueCartChains, setValue])

  if (!offers || loading) {
    return (
      <DrawerBody py={4} px={2}>
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
      </DrawerBody>
    )
  }
  if (Object.keys(offers).length === 0 || items.length === 0) {
    return (
      <DrawerBody py={4} px={2}>
        <VStack spacing={1} py={4}>
          <Text variant="subtitle2" color="gray.800">
            {t('cart.step.selection.empty.title')}
          </Text>
          <Text variant="caption">
            {t('cart.step.selection.empty.description')}
          </Text>
          <Button
            size="sm"
            as={Link}
            href="/explore?offers=fixed"
            variant="outline"
            mt={3}
          >
            {t('cart.step.selection.empty.action')}
          </Button>
        </VStack>
      </DrawerBody>
    )
  }
  return (
    <VStack as="form" onSubmit={submit} height="full">
      <DrawerBody py={4} px={2} height="full" width="full">
        <VStack alignItems="flex-start" width="full" {...getRootProps()}>
          {uniqueCartChains.map((chain, i) => {
            const radio = getRadioProps({ value: chain.id })
            return (
              <CartRadio key={i} {...radio} isChecked={chain.id === chainId}>
                <HStack gap={1} pointerEvents="none">
                  <Radio
                    isChecked={chain.id === chainId}
                    width="auto"
                    colorScheme="brand"
                  />
                  <Text variant="subtitle2">{chain.name}</Text>
                </HStack>
                {(itemsWithOffersByChain[chain.id] || []).map(
                  (cartItemWithOffer) => (
                    <CartDrawerListItem
                      key={cartItemWithOffer.offerId}
                      offer={cartItemWithOffer.offer}
                    />
                  ),
                )}
              </CartRadio>
            )
          })}
        </VStack>
      </DrawerBody>
      <Divider />
      <DrawerFooter width="full">
        <Button
          flexGrow={1}
          isDisabled={
            Object.keys(offers).length === 0 ||
            items.length === 0 ||
            !selectedChain
          }
          type="submit"
        >
          {t('cart.step.selection.button.label')}
        </Button>
      </DrawerFooter>
    </VStack>
  )
}

export default CartStepSelection
