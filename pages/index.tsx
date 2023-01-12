import {
  Button,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import { useWeb3React } from '@web3-react/core'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useEffect, useMemo } from 'react'
import Link from '../components/Link/Link'
import Slider from '../components/Slider/Slider'
import TokenCard from '../components/Token/Card'
import TokenHeader from '../components/Token/Header'
import {
  convertAsset,
  convertAssetWithSupplies,
  convertAuctionFull,
  convertAuctionWithBestBid,
  convertBid,
  convertOwnership,
  convertSale,
  convertSaleFull,
  convertUser,
} from '../convert'
import environment from '../environment'
import {
  FetchDefaultAssetIdsDocument,
  FetchDefaultAssetIdsQuery,
  FetchHomePageDocument,
  FetchHomePageQuery,
  useFetchHomePageQuery,
} from '../graphql'
import useBlockExplorer from '../hooks/useBlockExplorer'
import useEagerConnect from '../hooks/useEagerConnect'
import useOrderById from '../hooks/useOrderById'
import useSigner from '../hooks/useSigner'
import LargeLayout from '../layouts/large'
import { wrapServerSideProps } from '../props'

type Props = {
  now: string
  featuredTokens: string[]
  limit: number
  tokens: string[]
  currentAccount: string | null
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (ctx, client) => {
    const now = new Date()
    let tokensToRender
    if (environment.HOME_TOKENS) {
      // Randomize list of assets to display
      tokensToRender = environment.HOME_TOKENS.sort(
        () => Math.random() - 0.5,
      ).slice(0, environment.PAGINATION_LIMIT)
    } else {
      // Fallback to default list of assets
      const res = await client.query<FetchDefaultAssetIdsQuery>({
        query: FetchDefaultAssetIdsDocument,
        variables: {
          limit: environment.PAGINATION_LIMIT,
        },
      })
      tokensToRender = res.data.assets?.nodes.map((x) => x.id) || []
    }

    const { data, error } = await client.query<FetchHomePageQuery>({
      query: FetchHomePageDocument,
      variables: {
        featuredIds: environment.FEATURED_TOKEN,
        now,
        limit: environment.PAGINATION_LIMIT,
        assetIds: tokensToRender,
        address: ctx.user.address || '',
      },
    })
    if (error) throw error
    if (!data) throw new Error('data is falsy')
    return {
      props: {
        now: now.toJSON(),
        limit: environment.PAGINATION_LIMIT,
        featuredTokens: environment.FEATURED_TOKEN,
        tokens: tokensToRender,
        currentAccount: ctx.user.address,
      },
    }
  },
)

const HomePage: NextPage<Props> = ({
  currentAccount,
  featuredTokens,
  limit,
  now,
  tokens,
}) => {
  const ready = useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { account } = useWeb3React()
  const toast = useToast()
  const date = useMemo(() => new Date(now), [now])
  const { data, refetch, error } = useFetchHomePageQuery({
    variables: {
      featuredIds: featuredTokens,
      now: date,
      limit,
      assetIds: tokens,
      address: (ready ? account?.toLowerCase() : currentAccount) || '',
    },
  })

  useEffect(() => {
    if (!error) return
    console.error(error)
    toast({
      title: t('error.500'),
      status: 'error',
    })
  }, [error, t, toast])

  const blockExplorer = useBlockExplorer(
    environment.BLOCKCHAIN_EXPLORER_NAME,
    environment.BLOCKCHAIN_EXPLORER_URL,
  )

  const featured = useOrderById(featuredTokens, data?.featured?.nodes)
  const assets = useOrderById(tokens, data?.assets?.nodes)
  const currencies = useMemo(() => data?.currencies?.nodes || [], [data])
  const auctions = useMemo(() => data?.auctions?.nodes || [], [data])

  const reloadInfo = useCallback(async () => {
    void refetch()
  }, [refetch])

  const featuredAssets = useMemo(
    () =>
      featured?.map((asset) => (
        <TokenHeader
          key={asset.id}
          blockExplorer={blockExplorer}
          asset={convertAssetWithSupplies(asset)}
          currencies={currencies}
          auction={
            asset.auctions.nodes[0]
              ? convertAuctionFull(asset.auctions.nodes[0])
              : undefined
          }
          bestBid={
            asset.auctions.nodes[0]?.bestBid?.nodes[0]
              ? convertBid(asset.auctions.nodes[0]?.bestBid?.nodes[0])
              : undefined
          }
          sales={asset.sales.nodes.map(convertSaleFull)}
          creator={convertUser(asset.creator, asset.creator.address)}
          owners={asset.ownerships.nodes.map(convertOwnership)}
          isHomepage={true}
          signer={signer}
          currentAccount={account?.toLowerCase()}
          onOfferCanceled={reloadInfo}
          onAuctionAccepted={reloadInfo}
        />
      )),
    [featured, blockExplorer, account, signer, reloadInfo, currencies],
  )
  return (
    <LargeLayout>
      {featuredAssets && featuredAssets.length > 0 && (
        <header>
          {featuredAssets.length === 1 ? (
            featuredAssets
          ) : (
            <Flex as={Slider}>{featuredAssets}</Flex>
          )}
        </header>
      )}

      {auctions.length > 0 && (
        <Stack spacing={6} mt={12}>
          <Heading as="h2" variant="subtitle" color="brand.black">
            {t('home.auctions')}
          </Heading>
          <Slider>
            {auctions.map((x, i) => (
              <Flex
                key={i}
                grow={0}
                shrink={0}
                basis={{
                  base: '100%',
                  sm: '50%',
                  md: '33.33%',
                  lg: '25%',
                }}
                p="10px"
              >
                <TokenCard
                  asset={convertAsset(x.asset)}
                  creator={convertUser(
                    x.asset.creator,
                    x.asset.creator.address,
                  )}
                  auction={convertAuctionWithBestBid(x)}
                  sale={undefined}
                  numberOfSales={0}
                  hasMultiCurrency={false}
                />
              </Flex>
            ))}
          </Slider>
        </Stack>
      )}

      {assets.length > 0 && (
        <Stack spacing={6} mt={12}>
          <Flex flexWrap="wrap" justify="space-between" gap={4}>
            <Heading as="h2" variant="subtitle" color="brand.black">
              {t('home.featured')}
            </Heading>
            <Link href="/explore">
              <Button
                variant="outline"
                colorScheme="gray"
                rightIcon={<Icon as={HiArrowNarrowRight} h={5} w={5} />}
                iconSpacing="10px"
              >
                <Text as="span" isTruncated>
                  {t('home.explore')}
                </Text>
              </Button>
            </Link>
          </Flex>
          <SimpleGrid spacing={6} columns={{ sm: 2, md: 3, lg: 4 }}>
            {assets.map((x, i) => (
              <Flex key={i} justify="center">
                <TokenCard
                  asset={convertAsset(x)}
                  creator={convertUser(x.creator, x.creator.address)}
                  sale={convertSale(x.firstSale.nodes[0])}
                  auction={
                    x.auctions.nodes[0]
                      ? convertAuctionWithBestBid(x.auctions.nodes[0])
                      : undefined
                  }
                  numberOfSales={x.firstSale.totalCount}
                  hasMultiCurrency={
                    parseInt(
                      x.currencySales.aggregates?.distinctCount?.currencyId,
                      10,
                    ) > 1
                  }
                />
              </Flex>
            ))}
          </SimpleGrid>
        </Stack>
      )}
    </LargeLayout>
  )
}

export default HomePage
