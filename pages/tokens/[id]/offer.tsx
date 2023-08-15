import {
  Box,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Skeleton,
  useRadioGroup,
  useToast,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { AiOutlineDollarCircle } from '@react-icons/all-files/ai/AiOutlineDollarCircle'
import { HiOutlineClock } from '@react-icons/all-files/hi/HiOutlineClock'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import invariant from 'ts-invariant'
import Head from '../../../components/Head'
import BackButton from '../../../components/Navbar/BackButton'
import type { BidCurrency } from '../../../components/Offer/Form/Bid'
import Radio from '../../../components/Radio/Radio'
import SalesAuctionForm from '../../../components/Sales/Auction/Form'
import SalesDirectForm from '../../../components/Sales/Direct/Form'
import SkeletonForm from '../../../components/Skeleton/Form'
import SkeletonTokenCard from '../../../components/Skeleton/TokenCard'
import TokenCard from '../../../components/Token/Card'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertSale,
  convertUser,
} from '../../../convert'
import environment from '../../../environment'
import { useOfferForAssetQuery } from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useChainCurrencies from '../../../hooks/useChainCurrencies'
import useLoginRedirect from '../../../hooks/useLoginRedirect'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import useSigner from '../../../hooks/useSigner'
import SmallLayout from '../../../layouts/small'
import { isSameAddress } from '../../../utils'

type Props = {
  assetId: string
  now: string
  currentAccount: string | null
  meta: {
    title: string
    description: string
    image: string
  }
}

enum SaleType {
  FIXED_PRICE = 'FIXED_PRICE',
  TIMED_AUCTION = 'TIMED_AUCTION',
}

type SaleOption = {
  value: SaleType
  label: string
  icon: any
}

const OfferPage: NextPage<Props> = ({ now }) => {
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { back, push } = useRouter()
  const toast = useToast()
  const { address } = useAccount()
  useLoginRedirect()
  const assetId = useRequiredQueryParamSingle('id')
  const [chainId, collectionAddress, tokenId] = useMemo(
    () => assetId.split('-'),
    [assetId],
  )

  const date = useMemo(() => new Date(now), [now])
  const { data } = useOfferForAssetQuery({
    variables: {
      chainId: chainId ? parseInt(chainId, 10) : 0,
      collectionAddress: collectionAddress || '',
      tokenId: tokenId || '',
      now: date,
      address: address || '',
    },
  })

  const blockExplorer = useBlockExplorer(data?.asset?.chainId)

  const { data: currencyData } = useChainCurrencies(data?.asset?.chainId)

  const asset = data?.asset

  const royaltiesPerTenThousand =
    asset?.royalties.reduce((sum, { value }) => sum + value, 0) || 0

  const quantityAvailable = useMemo(
    () => BigNumber.from(asset?.owned?.quantity || 0),
    [asset],
  )

  const isCreator =
    asset && address
      ? isSameAddress(asset.creator.address.toLowerCase(), address)
      : false

  const currencies = useMemo(
    () => currencyData?.currencies?.nodes || [],
    [currencyData],
  )
  const auctionCurrencies = useMemo(
    () => currencies.filter((c) => c.address) as BidCurrency[],
    [currencies],
  )

  const saleOptions: [SaleOption, SaleOption] = useMemo(
    () => [
      {
        value: SaleType.FIXED_PRICE,
        label: t('offers.form.options.values.fixed'),
        icon: AiOutlineDollarCircle,
      },
      {
        value: SaleType.TIMED_AUCTION,
        label: t('offers.form.options.values.auction'),
        icon: HiOutlineClock,
        disabled: asset?.collection.standard !== 'ERC721',
      },
    ],
    [asset, t],
  )

  const [sale, setSale] = useState<SaleType>(saleOptions[0].value)

  const { getRadioProps, getRootProps } = useRadioGroup({
    defaultValue: sale,
    onChange: (e: any) => setSale(e.toString() as SaleType),
  })

  const onCreated = useCallback(async () => {
    toast({
      title: t('offers.form.notifications.created'),
      status: 'success',
    })
    await push(`/tokens/${assetId}`)
  }, [toast, t, push, assetId])

  const saleForm = useMemo(() => {
    if (!currencies || !asset) return <SkeletonForm items={2} />
    if (sale === SaleType.FIXED_PRICE)
      return (
        <SalesDirectForm
          chainId={asset.chainId}
          collectionAddress={asset.collectionAddress}
          tokenId={asset.tokenId}
          standard={asset.collection.standard}
          currencies={currencies}
          blockExplorer={blockExplorer}
          royaltiesPerTenThousand={royaltiesPerTenThousand}
          quantityAvailable={quantityAvailable}
          signer={signer}
          isCreator={isCreator}
          offerValidity={environment.OFFER_VALIDITY_IN_SECONDS}
          onCreated={onCreated}
        />
      )
    if (sale === SaleType.TIMED_AUCTION)
      return (
        <SalesAuctionForm
          signer={signer}
          assetId={asset.id}
          currencies={auctionCurrencies}
          auctionValidity={environment.AUCTION_VALIDITY_IN_SECONDS}
          onCreated={onCreated}
        />
      )
    invariant(true, 'Invalid sale type')
  }, [
    currencies,
    auctionCurrencies,
    asset,
    sale,
    blockExplorer,
    royaltiesPerTenThousand,
    quantityAvailable,
    signer,
    isCreator,
    onCreated,
  ])

  if (asset === null) return <Error statusCode={404} />
  return (
    <SmallLayout>
      <Head
        title={asset ? t('offers.form.meta.title', asset) : ''}
        description={asset ? t('offers.form.meta.description', asset) : ''}
        image={asset?.image}
      />

      <BackButton onClick={back} />
      <Heading as="h1" variant="title" color="brand.black" my={12}>
        {t('offers.form.title')}
      </Heading>

      <Grid
        mt={12}
        mb={6}
        gap={12}
        templateColumns={{ base: '1fr', md: '1fr 2fr' }}
      >
        <GridItem overflow="hidden">
          <Box pointerEvents="none">
            {!asset ? (
              <SkeletonTokenCard />
            ) : (
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
                  asset.firstSale.totalCurrencyDistinctCount > 1
                }
              />
            )}
          </Box>
        </GridItem>
        <GridItem>
          <Flex direction="column" gap={8} grow={1} shrink={1} basis="0%">
            {!asset ? (
              <>
                <Skeleton height="24px" width="100px" />
                <Flex gap={4}>
                  <Skeleton height="85px" width="100%" borderRadius="2xl" />
                  <Skeleton height="85px" width="100%" borderRadius="2xl" />
                </Flex>
              </>
            ) : (
              <FormControl>
                <FormLabel>{t('offers.form.options.label')}</FormLabel>
                <FormHelperText mb={2}>
                  {sale === SaleType.FIXED_PRICE
                    ? t('offers.form.options.hints.fixed')
                    : t('offers.form.options.hints.auction')}
                </FormHelperText>
                <Flex mt={3} flexWrap="wrap" gap={4} {...getRootProps()}>
                  {saleOptions.map((choice, i) => {
                    const radio = getRadioProps({ value: choice.value })
                    return <Radio key={i} choice={choice} {...radio} />
                  })}
                </Flex>
              </FormControl>
            )}

            {saleForm}
          </Flex>
        </GridItem>
      </Grid>
    </SmallLayout>
  )
}

export default OfferPage
