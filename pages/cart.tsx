import { Button, Flex, Heading, Text, VStack } from '@chakra-ui/react'
import { useAcceptOffer } from '@liteflow/react'
import { BigNumber } from 'ethers'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useMemo } from 'react'
import Head from '../components/Head'
import Image from '../components/Image/Image'
import Price from '../components/Price/Price'
import { useFetchCartItemsQuery } from '../graphql'
import useCart from '../hooks/useCart'
import useSigner from '../hooks/useSigner'
import LargeLayout from '../layouts/large'

const CartPage: NextPage = () => {
  const { t } = useTranslation('templates')
  const { items } = useCart()
  const signer = useSigner()
  const [acceptOffer] = useAcceptOffer(signer)

  const { data, loading } = useFetchCartItemsQuery({
    variables: { offerIds: items.map((x) => x.offerId) },
  })

  const itemsWithOffer = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        offer:
          data?.offerOpenSales?.nodes.find((x) => x.id === item.offerId) ||
          null,
      })),
    [items, data],
  )

  const purchase = useCallback(async () => {
    for (const item of items) {
      await acceptOffer(item.offerId, item.quantity || 1)
    }
  }, [items, acceptOffer])

  if (loading) return <span>loading...</span>
  return (
    <LargeLayout>
      <Head title={t('cart.title')} />
      <Heading as="h1" variant="title" color="brand.black" mb={4}>
        {t('cart.title')}
      </Heading>
      <VStack spacing={4}>
        {itemsWithOffer.map(({ offerId, offer, quantity }) =>
          offer ? (
            <Flex key={offerId}>
              <Image
                src={offer.asset.image}
                alt={offer.asset.name}
                width={100}
                height={100}
              />
              <VStack>
                <Text>{offer.asset.name}</Text>
                <Text>{offer.asset.collection.name}</Text>
              </VStack>
              <Price
                amount={BigNumber.from(offer.unitPrice).mul(quantity || 1)}
                currency={offer.currency}
              />
            </Flex>
          ) : (
            <Text key={offerId}>Invalid offer</Text>
          ),
        )}
      </VStack>
      <Button onClick={purchase}>Buy all</Button>
    </LargeLayout>
  )
}

export default CartPage
