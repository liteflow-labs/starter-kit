import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import Head from '../../components/Head'
import Image from '../../components/Image/Image'
import Loader from '../../components/Loader'
import BackButton from '../../components/Navbar/BackButton'
import OfferFormCheckout from '../../components/Offer/Form/Checkout'
import Price from '../../components/Price/Price'
import TokenCard from '../../components/Token/Card'
import Avatar from '../../components/User/Avatar'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertSale,
  convertUser,
} from '../../convert'
import environment from '../../environment'
import { useCheckoutQuery } from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useBlockExplorer from '../../hooks/useBlockExplorer'
import useEagerConnect from '../../hooks/useEagerConnect'
import useRequiredQueryParamSingle from '../../hooks/useRequiredQueryParamSingle'
import useSigner from '../../hooks/useSigner'
import SmallLayout from '../../layouts/small'

type Props = {
  now: string
}

const CheckoutPage: NextPage<Props> = ({ now }) => {
  useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { back, push } = useRouter()
  const toast = useToast()
  const offerId = useRequiredQueryParamSingle('id')

  const { address } = useAccount()

  const date = useMemo(() => new Date(now), [now])
  const { data, loading } = useCheckoutQuery({
    variables: {
      id: offerId,
      now: date,
      address: address || '',
    },
  })

  const offer = useMemo(() => data?.offer, [data])
  const asset = useMemo(() => offer?.asset, [offer])
  const priceUnit = useMemo(
    () => (offer ? BigNumber.from(offer.unitPrice) : undefined),
    [offer],
  )
  const isSingle = useMemo(
    () => asset?.collection.standard === 'ERC721',
    [asset],
  )

  const blockExplorer = useBlockExplorer(asset?.collection.chainId)

  const onPurchased = useCallback(async () => {
    if (!data?.offer) return
    toast({
      title: t('offers.checkout.notifications.purchased'),
      status: 'success',
    })
    await push(`/tokens/${data.offer.asset.id}`)
  }, [data, toast, t, push])

  if (loading) return <Loader fullPage />
  if (!offer) return null
  if (!asset) return null
  return (
    <SmallLayout>
      <Head
        title={t('offers.checkout.meta.title', offer.asset)}
        description={t('offers.checkout.meta.description', {
          name: offer.asset.name,
          creator: offer.asset.creator.name || offer.asset.creator.address,
        })}
        image={offer.asset.image}
      />

      <BackButton onClick={back} />
      <Heading as="h1" variant="title" color="brand.black" mt={12}>
        {t('offers.checkout.title')}
      </Heading>

      <Grid
        mt={12}
        mb={6}
        gap={12}
        templateColumns={{ base: '1fr', md: '1fr 2fr' }}
      >
        <GridItem overflow="hidden">
          <Box pointerEvents="none">
            <TokenCard
              asset={convertAsset(asset)}
              creator={convertUser(asset.creator, asset.creator.address)}
              sale={convertSale(asset.firstSale.nodes[0])}
              auction={
                asset.auctions.nodes[0]
                  ? convertAuctionWithBestBid(asset.auctions.nodes[0])
                  : undefined
              }
              numberOfSales={asset.firstSale.totalCount}
              hasMultiCurrency={
                parseInt(
                  asset.currencySales.aggregates?.distinctCount?.currencyId,
                  10,
                ) > 1
              }
            />
          </Box>
        </GridItem>
        <GridItem>
          <Flex direction="column" flex="1 1 0%">
            <Stack spacing={3} mb={3}>
              <Heading as="h5" variant="heading3" color="gray.500">
                {t('offers.checkout.from')}
              </Heading>
              <Avatar
                address={offer.maker.address}
                image={offer.maker.image}
                name={offer.maker.name}
                verified={offer.maker.verification?.status === 'VALIDATED'}
              />
            </Stack>

            <Stack spacing={3}>
              <Heading as="h5" variant="heading3" color="gray.500">
                {t('offers.checkout.on-sale')}
              </Heading>
              <Flex align="center" gap={3}>
                <Flex
                  as="span"
                  border="1px"
                  borderColor="gray.200"
                  h={8}
                  w={8}
                  align="center"
                  justify="center"
                  rounded="full"
                >
                  <Image
                    src={offer.currency.image}
                    alt={`${offer.currency.symbol} Logo`}
                    width={32}
                    height={32}
                    objectFit="cover"
                  />
                </Flex>
                {priceUnit && (
                  <Heading as="h2" variant="subtitle" color="brand.black">
                    <Price amount={priceUnit} currency={offer.currency} />
                  </Heading>
                )}
                {!isSingle && (
                  <Heading as="h5" variant="heading3" color="gray.500" ml={2}>
                    {t('offers.checkout.per-edition')}
                  </Heading>
                )}
              </Flex>
            </Stack>
            <Box as="hr" my={8} />

            <OfferFormCheckout
              signer={signer}
              chainId={asset.collection.chainId}
              account={address}
              offer={offer}
              blockExplorer={blockExplorer}
              currency={offer.currency}
              multiple={!isSingle}
              onPurchased={onPurchased}
              allowTopUp={environment.ALLOW_TOP_UP}
            />
          </Flex>
        </GridItem>
      </Grid>
    </SmallLayout>
  )
}

export default CheckoutPage
