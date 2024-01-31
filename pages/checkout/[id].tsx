import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Skeleton,
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
import BackButton from '../../components/Navbar/BackButton'
import OfferFormCheckout from '../../components/Offer/Form/Checkout'
import Price from '../../components/Price/Price'
import SkeletonImageAndText from '../../components/Skeleton/ImageAndText'
import SkeletonTokenCard from '../../components/Skeleton/TokenCard'
import TokenCard from '../../components/Token/Card'
import Avatar from '../../components/User/Avatar'
import { useCheckoutQuery } from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useRequiredQueryParamSingle from '../../hooks/useRequiredQueryParamSingle'
import SmallLayout from '../../layouts/small'
import Error from '../_error'

type Props = {
  now: string
}

const CheckoutPage: NextPage<Props> = ({ now }) => {
  const { t } = useTranslation('templates')
  const { back, push } = useRouter()
  const toast = useToast()
  const offerId = useRequiredQueryParamSingle('id')

  const { address } = useAccount()

  const date = useMemo(() => new Date(now), [now])
  const { data: offerData } = useCheckoutQuery({
    variables: {
      id: offerId,
      address: address || '',
      now: date,
    },
  })
  const offer = offerData?.offer
  const asset = offer?.asset

  const priceUnit = useMemo(
    () => (offer ? BigNumber.from(offer.unitPrice) : undefined),
    [offer],
  )
  const isSingle = useMemo(
    () => asset?.collection.standard === 'ERC721',
    [asset],
  )

  const onPurchased = useCallback(async () => {
    if (!asset) return
    toast({
      title: t('offers.checkout.notifications.purchased'),
      status: 'success',
    })
    await push(`/tokens/${asset.id}`)
  }, [asset, toast, t, push])

  if (
    offer === null ||
    asset === null ||
    asset?.deletedAt ||
    offer?.currency.deletedAt
  ) {
    return <Error statusCode={404} />
  }
  return (
    <SmallLayout>
      <Head
        title={asset && t('offers.checkout.meta.title', asset)}
        description={
          asset &&
          t('offers.checkout.meta.description', {
            name: asset.name,
            creator: asset.creator.name || asset.creator.address,
          })
        }
        image={asset?.image}
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
            {!asset ? <SkeletonTokenCard /> : <TokenCard asset={asset} />}
          </Box>
        </GridItem>
        <GridItem>
          <Flex direction="column" flex="1 1 0%">
            <Stack spacing={3} mb={3}>
              <Heading as="h5" variant="heading3" color="gray.500">
                {t('offers.checkout.from')}
              </Heading>
              {!offer ? (
                <SkeletonImageAndText />
              ) : (
                <Avatar user={offer.maker} />
              )}
            </Stack>

            <Stack spacing={3}>
              <Heading as="h5" variant="heading3" color="gray.500">
                {t('offers.checkout.on-sale')}
              </Heading>
              <Flex align="center" gap={3}>
                {!offer ? (
                  <SkeletonImageAndText large />
                ) : (
                  <>
                    <Flex
                      position="relative"
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
                        fill
                        sizes="30px"
                        objectFit="cover"
                      />
                    </Flex>
                    {priceUnit && (
                      <Heading as="h2" variant="subtitle" color="brand.black">
                        <Price amount={priceUnit} currency={offer.currency} />
                      </Heading>
                    )}
                    {!isSingle && (
                      <Heading
                        as="h5"
                        variant="heading3"
                        color="gray.500"
                        ml={2}
                      >
                        {t('offers.checkout.per-edition')}
                      </Heading>
                    )}
                  </>
                )}
              </Flex>
            </Stack>
            <Box as="hr" my={8} />

            {!offer ? (
              <Skeleton width="200px" height="40px" />
            ) : (
              <OfferFormCheckout
                offer={offer}
                multiple={!isSingle}
                onPurchased={onPurchased}
              />
            )}
          </Flex>
        </GridItem>
      </Grid>
    </SmallLayout>
  )
}

export default CheckoutPage
