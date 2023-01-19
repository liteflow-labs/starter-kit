import { Box, chakra, Flex, SimpleGrid, Text } from '@chakra-ui/react'
import { useWeb3React } from '@web3-react/core'
import CollectionHeader from 'components/Collection/CollectionHeader'
import Empty from 'components/Empty/Empty'
import Head from 'components/Head'
import Pagination from 'components/Pagination/Pagination'
import Select from 'components/Select/Select'
import TokenCard from 'components/Token/Card'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertCollectionFull,
  convertSale,
  convertUser,
} from 'convert'
import environment from 'environment'
import useEagerConnect from 'hooks/useEagerConnect'
import useExecuteOnAccountChange from 'hooks/useExecuteOnAccountChange'
import usePaginate from 'hooks/usePaginate'
import LargeLayout from 'layouts/large'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { wrapServerSideProps } from 'props'
import { FC, useCallback, useMemo } from 'react'
import invariant from 'ts-invariant'
import {
  AssetsOrderBy,
  FetchCollectionAssetsDocument,
  FetchCollectionAssetsQuery,
  FetchCollectionAssetsQueryVariables,
  FetchCollectionDetailsDocument,
  FetchCollectionDetailsQuery,
  FetchCollectionDetailsQueryVariables,
  useFetchCollectionAssetsQuery,
  useFetchCollectionDetailsQuery,
} from '../../graphql'

type Props = {
  address: string
  currentAccount: string | null
  now: string
  // Pagination
  limit: number
  page: number
  offset: number
  // OrderBy
  orderBy: AssetsOrderBy
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (ctx, client) => {
    const now = new Date()
    const collectionAddress = ctx.params?.id
      ? Array.isArray(ctx.params.id)
        ? ctx.params.id[0]
        : ctx.params.id
      : null
    invariant(collectionAddress, 'Collection Address is required')
    const limit = ctx.query.limit
      ? Array.isArray(ctx.query.limit)
        ? parseInt(ctx.query.limit[0] || '0', 10)
        : parseInt(ctx.query.limit, 10)
      : environment.PAGINATION_LIMIT
    const page = ctx.query.page
      ? Array.isArray(ctx.query.page)
        ? parseInt(ctx.query.page[0] || '0', 10)
        : parseInt(ctx.query.page, 10)
      : 1
    const offset = (page - 1) * limit
    const orderBy = Array.isArray(ctx.query.orderBy)
      ? (ctx.query.orderBy[0] as AssetsOrderBy)
      : (ctx.query.orderBy as AssetsOrderBy) ||
        'SALES_MIN_UNIT_PRICE_IN_REF_ASC'

    const { data: collectionDetailsData, error: collectionDetailsError } =
      await client.query<
        FetchCollectionDetailsQuery,
        FetchCollectionDetailsQueryVariables
      >({
        query: FetchCollectionDetailsDocument,
        variables: {
          address: collectionAddress,
          chainId: environment.CHAIN_ID,
        },
      })

    const { data: collectionAssetsData, error: collectionAssetsError } =
      await client.query<
        FetchCollectionAssetsQuery,
        FetchCollectionAssetsQueryVariables
      >({
        query: FetchCollectionAssetsDocument,
        variables: {
          currentAccount: ctx.user.address || '',
          now,
          offset,
          limit,
          address: collectionAddress,
          chainId: environment.CHAIN_ID,
          orderBy,
        },
      })

    if (collectionDetailsError) throw collectionDetailsError
    if (!collectionDetailsData)
      throw new Error('collectionDetailsData is falsy')
    if (!collectionDetailsData.collection) return { notFound: true }
    if (collectionAssetsError) throw collectionAssetsError
    if (!collectionAssetsData) throw new Error('collectionAssetsData is falsy')

    return {
      props: {
        address: collectionAddress,
        currentAccount: ctx.user.address,
        now: now.toJSON(),
        limit,
        page,
        offset,
        orderBy,
      },
    }
  },
)

const CollectionPage: FC<Props> = ({
  address,
  now,
  currentAccount,
  limit,
  page,
  offset,
  orderBy,
}) => {
  const ready = useEagerConnect()
  const { query, replace, pathname } = useRouter()
  const { t } = useTranslation('templates')
  const date = useMemo(() => new Date(now), [now])
  const { account } = useWeb3React()
  const { data: collectionData } = useFetchCollectionDetailsQuery({
    variables: {
      address: address,
      chainId: environment.CHAIN_ID,
    },
  })
  const { data, refetch } = useFetchCollectionAssetsQuery({
    variables: {
      address,
      now: date,
      currentAccount: (ready ? account?.toLowerCase() : currentAccount) || '',
      limit,
      offset,
      orderBy,
      chainId: environment.CHAIN_ID,
    },
  })
  useExecuteOnAccountChange(refetch, ready)

  const collectionDetails = useMemo(
    () =>
      collectionData?.collection
        ? convertCollectionFull(collectionData.collection)
        : null,
    [collectionData],
  )

  const [changePage, changeLimit] = usePaginate()

  const changeOrder = useCallback(
    async (orderBy: any) => {
      await replace({
        pathname,
        query: { ...query, orderBy, page: undefined },
      })
    },
    [replace, pathname, query],
  )

  const assets = useMemo(() => data?.assets?.nodes || [], [data])

  const ChakraPagination = chakra(Pagination)

  if (!collectionDetails) return null
  return (
    <LargeLayout>
      <Head title="Explore collection" />

      <CollectionHeader
        collection={collectionDetails}
        baseURL={environment.BASE_URL}
        reportEmail={environment.REPORT_EMAIL}
        explorer={{
          name: environment.BLOCKCHAIN_EXPLORER_NAME,
          url: environment.BLOCKCHAIN_EXPLORER_URL,
        }}
      />

      <Box pt={4}>
        <Box ml="auto" w={{ base: 'full', lg: 'min-content' }}>
          <Select<AssetsOrderBy>
            name="orderBy"
            onChange={changeOrder}
            choices={[
              {
                label: t('collection.orderBy.values.salesMinUnitPriceInRefAsc'),
                value: 'SALES_MIN_UNIT_PRICE_IN_REF_ASC',
              },
              {
                label: t(
                  'collection.orderBy.values.salesMinUnitPriceInRefDesc',
                ),
                value: 'SALES_MIN_UNIT_PRICE_IN_REF_DESC',
              },
              {
                label: t('collection.orderBy.values.createdAtDesc'),
                value: 'CREATED_AT_DESC',
              },
              {
                label: t('collection.orderBy.values.createdAtAsc'),
                value: 'CREATED_AT_ASC',
              },
            ]}
            value={orderBy}
            inlineLabel
          />
        </Box>
        {assets.length > 0 ? (
          <SimpleGrid
            flexWrap="wrap"
            spacing={{ base: 4, lg: 3, xl: 4 }}
            columns={{ base: 1, sm: 2, md: 4, xl: 5, '2xl': 6 }}
            py={6}
          >
            {assets.map((x, i) => (
              <Flex key={i} justify="center">
                <TokenCard
                  asset={convertAsset(x)}
                  creator={convertUser(x.creator, x.creator.address)}
                  auction={
                    x.auctions.nodes[0]
                      ? convertAuctionWithBestBid(x.auctions.nodes[0])
                      : undefined
                  }
                  sale={convertSale(x.firstSale.nodes[0])}
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
        ) : (
          <Flex align="center" justify="center" h="full" py={12}>
            <Empty
              title={t('collection.empty.title')}
              description={t('collection.empty.description')}
            />
          </Flex>
        )}

        <ChakraPagination
          py="6"
          borderTop="1px"
          borderColor="gray.200"
          limit={limit}
          limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
          page={page}
          total={data?.assets?.totalCount}
          onPageChange={changePage}
          onLimitChange={changeLimit}
          result={{
            label: t('pagination.result.label'),
            caption: (props) => (
              <Trans
                ns="templates"
                i18nKey="pagination.result.caption"
                values={props}
                components={[<Text as="span" color="brand.black" key="text" />]}
              />
            ),
            pages: (props) =>
              t('pagination.result.pages', { count: props.total }),
          }}
        />
      </Box>
    </LargeLayout>
  )
}

export default CollectionPage
