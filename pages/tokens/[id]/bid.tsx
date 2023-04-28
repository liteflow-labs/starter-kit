import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { HiOutlineClock } from '@react-icons/all-files/hi/HiOutlineClock'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import Countdown from '../../../components/Countdown/Countdown'
import Head from '../../../components/Head'
import Image from '../../../components/Image/Image'
import Loader from '../../../components/Loader'
import BackButton from '../../../components/Navbar/BackButton'
import OfferFormBid from '../../../components/Offer/Form/Bid'
import Price from '../../../components/Price/Price'
import TokenCard from '../../../components/Token/Card'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertSale,
  convertUser,
} from '../../../convert'
import environment from '../../../environment'
import { useBidOnAssetQuery, useFeesForBidQuery } from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useChainCurrencies from '../../../hooks/useChainCurrencies'
import useEagerConnect from '../../../hooks/useEagerConnect'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import useSigner from '../../../hooks/useSigner'
import SmallLayout from '../../../layouts/small'

type Props = {
  now: string
}

const BidPage: NextPage<Props> = ({ now }) => {
  useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { back, push } = useRouter()
  const toast = useToast()
  const { address } = useAccount()
  const assetId = useRequiredQueryParamSingle('id')

  const date = useMemo(() => new Date(now), [now])
  const { data, loading } = useBidOnAssetQuery({
    variables: {
      id: assetId,
      now: date,
      address: address || '',
    },
  })

  const currencyRes = useChainCurrencies(data?.asset?.chainId, {
    onlyERC20: true,
  })

  const fees = useFeesForBidQuery({
    variables: {
      id: assetId,
    },
  })

  const feesPerTenThousand = fees.data?.orderFees.valuePerTenThousand || 0

  const blockExplorer = useBlockExplorer(data?.asset?.chainId)

  const asset = useMemo(() => data?.asset, [data])

  const auction = useMemo(
    () => (asset?.auctions.nodes[0] ? asset.auctions.nodes[0] : undefined),
    [asset],
  )
  const currencies = useMemo(
    () =>
      auction ? [auction.currency] : currencyRes.data?.currencies?.nodes || [],
    [auction, currencyRes],
  )

  const highestBid = useMemo(() => auction?.bestBid.nodes[0], [auction])

  const onCreated = useCallback(async () => {
    toast({
      title: t('offers.bid.notifications.created'),
      status: 'success',
    })
    await push(`/tokens/${assetId}`)
  }, [toast, t, push, assetId])

  if (loading) return <Loader fullPage />
  if (!asset) return <></>
  return (
    <SmallLayout>
      <Head
        title={t('offers.bid.meta.title', asset)}
        description={t('offers.bid.meta.description', {
          name: asset.name,
          creator: asset.creator.name || asset.creator.address,
        })}
        image={asset.image}
      />
      <BackButton onClick={back} />
      <Heading as="h1" variant="title" color="brand.black" my={12}>
        {t('offers.bid.title')}
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
              auction={auction ? convertAuctionWithBestBid(auction) : undefined}
              sale={convertSale(asset.firstSale.nodes[0])}
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
            {auction && (
              <>
                <Stack mb={highestBid ? 6 : 0} spacing={3}>
                  <Heading as="h5" variant="heading3" color="gray.500">
                    {t('offers.bid.auction')}
                  </Heading>
                  <Flex align="center" gap={3}>
                    <Flex
                      as="span"
                      bgColor="brand.500"
                      h={8}
                      w={8}
                      align="center"
                      justify="center"
                      rounded="full"
                    >
                      <Icon as={HiOutlineClock} h={5} w={5} color="white" />
                    </Flex>
                    <Heading as="h2" variant="subtitle" color="brand.black">
                      <Countdown date={auction.endAt} />
                    </Heading>
                  </Flex>
                </Stack>
                {highestBid && (
                  <Stack spacing={3}>
                    <Heading as="h5" variant="heading3" color="gray.500">
                      {t('offers.bid.highestBid')}
                    </Heading>
                    <Flex align="center" gap={3}>
                      <Flex
                        align="center"
                        justify="center"
                        h={8}
                        w={8}
                        rounded="full"
                        border="1px"
                        borderColor="gray.200"
                      >
                        <Image
                          src={highestBid.currency.image}
                          alt={`${highestBid.currency.symbol} Logo`}
                          width={32}
                          height={32}
                          objectFit="cover"
                        />
                      </Flex>
                      <Heading as="h2" variant="subtitle" color="brand.black">
                        <Price
                          amount={BigNumber.from(highestBid.unitPrice)}
                          currency={highestBid.currency}
                        />
                      </Heading>
                    </Flex>
                  </Stack>
                )}
                <Box as="hr" my={8} />
              </>
            )}

            {asset.collection.standard === 'ERC721' &&
              asset.ownerships.nodes[0] && (
                <OfferFormBid
                  signer={signer}
                  account={address}
                  assetId={asset.id}
                  chainId={asset.chainId}
                  multiple={false}
                  owner={asset.ownerships.nodes[0].ownerAddress}
                  currencies={currencies}
                  blockExplorer={blockExplorer}
                  onCreated={onCreated}
                  auctionId={auction?.id}
                  auctionValidity={environment.AUCTION_VALIDITY_IN_SECONDS}
                  offerValidity={environment.OFFER_VALIDITY_IN_SECONDS}
                  feesPerTenThousand={feesPerTenThousand}
                  allowTopUp={environment.ALLOW_TOP_UP}
                />
              )}
            {asset.collection.standard === 'ERC1155' && (
              <OfferFormBid
                signer={signer}
                account={address}
                assetId={asset.id}
                chainId={asset.chainId}
                multiple={true}
                supply={asset.ownerships.aggregates?.sum?.quantity || '0'}
                currencies={currencies}
                blockExplorer={blockExplorer}
                onCreated={onCreated}
                auctionId={auction?.id}
                auctionValidity={environment.AUCTION_VALIDITY_IN_SECONDS}
                offerValidity={environment.OFFER_VALIDITY_IN_SECONDS}
                feesPerTenThousand={feesPerTenThousand}
                allowTopUp={environment.ALLOW_TOP_UP}
              />
            )}
          </Flex>
        </GridItem>
      </Grid>
    </SmallLayout>
  )
}

export default BidPage
