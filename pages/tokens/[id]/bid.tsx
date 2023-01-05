import { Box, Flex, Heading, Icon, Stack, useToast } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { HiOutlineClock } from '@react-icons/all-files/hi/HiOutlineClock'
import { useWeb3React } from '@web3-react/core'
import { NextPage } from 'next'
import getT from 'next-translate/getT'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import invariant from 'ts-invariant'
import Countdown from '../../../components/Countdown/Countdown'
import Head from '../../../components/Head'
import Image from '../../../components/Image/Image'
import BackButton from '../../../components/Navbar/BackButton'
import OfferFormBid from '../../../components/Offer/Form/Bid'
import Price from '../../../components/Price/Price'
import TokenCard from '../../../components/Token/Card'
import connectors from '../../../connectors'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertSale,
  convertUser,
} from '../../../convert'
import environment from '../../../environment'
import {
  BidOnAssetDocument,
  BidOnAssetQuery,
  FeesForBidDocument,
  FeesForBidQuery,
  useBidOnAssetQuery,
  useFeesForBidQuery,
} from '../../../graphql'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useEagerConnect from '../../../hooks/useEagerConnect'
import useExecuteOnAccountChange from '../../../hooks/useExecuteOnAccountChange'
import useSigner from '../../../hooks/useSigner'
import SmallLayout from '../../../layouts/small'
import { wrapServerSideProps } from '../../../props'

type Props = {
  assetId: string
  now: string
  meta: {
    title: string
    description: string
    image: string
  }
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (ctx, client) => {
    const t = await getT(ctx.locale, 'templates')
    const assetId = ctx.params?.id
      ? Array.isArray(ctx.params.id)
        ? ctx.params.id[0]
        : ctx.params.id
      : null
    invariant(assetId, 'assetId is falsy')

    const now = new Date()
    const { data, error } = await client.query<BidOnAssetQuery>({
      query: BidOnAssetDocument,
      variables: {
        id: assetId,
        now,
      },
    })
    if (error) throw error
    if (!data.asset) return { notFound: true }
    const feeQuery = await client.query<FeesForBidQuery>({
      query: FeesForBidDocument,
      variables: { id: assetId },
    })
    if (feeQuery.error) throw error
    return {
      props: {
        assetId,
        now: now.toJSON(),
        meta: {
          title: t('offers.bid.meta.title', data.asset),
          description: t('offers.bid.meta.description', {
            name: data.asset.name,
            creator: data.asset.creator.name || data.asset.creator.address,
          }),
          image: data.asset.image,
        },
      },
    }
  },
)

const BidPage: NextPage<Props> = ({ now, assetId, meta }) => {
  const ready = useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { back, push } = useRouter()
  const toast = useToast()
  const { account } = useWeb3React()

  const date = useMemo(() => new Date(now), [now])
  const { data, refetch } = useBidOnAssetQuery({
    variables: {
      id: assetId,
      now: date,
    },
  })
  useExecuteOnAccountChange(refetch, ready)

  const fees = useFeesForBidQuery({
    variables: {
      id: assetId,
    },
  })

  const feesPerTenThousand = fees.data?.orderFees.valuePerTenThousand || 0

  const blockExplorer = useBlockExplorer(
    environment.BLOCKCHAIN_EXPLORER_NAME,
    environment.BLOCKCHAIN_EXPLORER_URL,
  )

  const asset = useMemo(() => data?.asset, [data])

  const auction = useMemo(
    () => (asset?.auctions.nodes[0] ? asset.auctions.nodes[0] : undefined),
    [asset],
  )
  const currencies = useMemo(
    () => (auction ? [auction.currency] : data?.currencies?.nodes || []),
    [auction, data],
  )

  const highestBid = useMemo(() => auction?.bestBid.nodes[0], [auction])

  const onCreated = useCallback(async () => {
    toast({
      title: t('offers.bid.notifications.created'),
      status: 'success',
    })
    await push(`/tokens/${assetId}`)
  }, [toast, t, push, assetId])

  if (!asset) return <></>
  return (
    <SmallLayout>
      <Head
        title={meta.title}
        description={meta.description}
        image={meta.image}
      />
      <BackButton onClick={back} />
      <Heading as="h1" variant="title" color="brand.black" my={12}>
        {t('offers.bid.title')}
      </Heading>

      <Flex
        mt={12}
        mb={6}
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'center', md: 'flex-start' }}
        justify="stretch"
        gap={12}
      >
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
                account={account?.toLowerCase()}
                assetId={asset.id}
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
                login={{
                  ...connectors,
                  networkName: environment.NETWORK_NAME,
                }}
              />
            )}
          {asset.collection.standard === 'ERC1155' && (
            <OfferFormBid
              signer={signer}
              account={account?.toLowerCase()}
              assetId={asset.id}
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
              login={{
                ...connectors,
                networkName: environment.NETWORK_NAME,
              }}
            />
          )}
        </Flex>
      </Flex>
    </SmallLayout>
  )
}

export default BidPage
