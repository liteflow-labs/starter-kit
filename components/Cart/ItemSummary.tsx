import { Flex, HStack, Skeleton, SkeletonText, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import invariant from 'ts-invariant'
import { useFetchCartItemsQuery } from '../../graphql'
import { CartItem } from '../../hooks/useCart'
import useEnvironment from '../../hooks/useEnvironment'
import { useOrderByKey } from '../../hooks/useOrderByKey'
import Image from '../Image/Image'
import List, { ListItem } from '../List/List'
import Price from '../Price/Price'

type Props = {
  chainId: number
  cartItems: CartItem[]
}

const CartItemSummary: FC<Props> = ({ chainId, cartItems }) => {
  const { t } = useTranslation('components')
  const { CHAINS } = useEnvironment()
  const offerIds = useMemo(
    () => cartItems.map((item) => item.offerId),
    [cartItems],
  )

  const { data, loading } = useFetchCartItemsQuery({
    variables: { offerIds },
  })

  const orderedCartItems = useOrderByKey(
    offerIds,
    data?.offerOpenSales?.nodes,
    (offers) => offers.id,
  )

  const chain = useMemo(() => {
    const c = CHAINS.find((x) => x.id === chainId)
    invariant(c)
    return {
      ...c,
      image: `/chains/${c.id}.svg`,
      name: c.name,
    }
  }, [CHAINS, chainId])

  if (loading)
    return (
      <List width="full">
        {new Array(3).fill(0).map((_, index) => (
          <ListItem
            key={index}
            label={<SkeletonText noOfLines={1} width="24" />}
            action={<Skeleton noOfLines={1} width="24" height="2em" />}
          />
        ))}
      </List>
    )

  return (
    <>
      <HStack gap={1}>
        <Text variant="subtitle2">
          {t('cart.step.transaction.summary.title')}
        </Text>
        <Image
          src={chain.image}
          alt={chain.name}
          width={16}
          height={16}
          h={4}
          w={4}
          ml={1}
        />
      </HStack>
      <Flex
        flexDirection="column"
        gap={2}
        rounded="md"
        borderWidth="2px"
        p={2}
        shadow="sm"
        w="full"
        h="full"
      >
        {orderedCartItems?.map((offer, i) => (
          <ListItem
            key={i}
            image={
              <Image
                src={offer.asset.image}
                alt={offer.asset.name}
                width={40}
                height={40}
                w={10}
                h={10}
                objectFit="cover"
              />
            }
            label={
              <Text
                variant="subtitle2"
                color="gray.800"
                title={offer.asset.name}
              >
                {offer.asset.name}
              </Text>
            }
            subtitle={
              <Text title={offer.asset.collection.name} variant="caption">
                {offer.asset.collection.name}
              </Text>
            }
            action={
              <Text variant="subtitle2" textAlign="end">
                <Price amount={offer.unitPrice} currency={offer.currency} />
              </Text>
            }
            imageRounded="md"
            rounded="xl"
          />
        ))}
      </Flex>
    </>
  )
}

export default CartItemSummary
