import {
  Box,
  chakra,
  Flex,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  SimpleGrid,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { removeEmptyFromObject } from '@nft/hooks'
import { useWeb3React } from '@web3-react/core'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { wrapServerSideProps } from 'props'
import { FC, useCallback, useMemo } from 'react'
import invariant from 'ts-invariant'
import CollectionHeader from '../../../components/Collection/CollectionHeader'
import Empty from '../../../components/Empty/Empty'
import FilterAsset, { NoFilter } from '../../../components/Filter/FilterAsset'
import FilterNav from '../../../components/Filter/FilterNav'
import Head from '../../../components/Head'
import Pagination from '../../../components/Pagination/Pagination'
import Select from '../../../components/Select/Select'
import TokenCard from '../../../components/Token/Card'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertCollectionFull,
  convertSale,
  convertUser,
} from '../../../convert'
import environment from '../../../environment'
import {
  AssetsOrderBy,
  Currency,
  FetchCollectionAssetsDocument,
  FetchCollectionAssetsQuery,
  FetchCollectionAssetsQueryVariables,
  FetchCollectionDetailsDocument,
  FetchCollectionDetailsQuery,
  FetchCollectionDetailsQueryVariables,
  FetchCurrenciesDocument,
  FetchCurrenciesQuery,
  useFetchCollectionAssetsQuery,
  useFetchCollectionDetailsQuery,
} from '../../../graphql'
import useAssetFilterFromQuery, {
  convertFilterToAssetFilter,
  extractTraitsFromQuery,
  Filter,
  OfferFilter,
} from '../../../hooks/useAssetFilterFromQuery'
import useEagerConnect from '../../../hooks/useEagerConnect'
import useExecuteOnAccountChange from '../../../hooks/useExecuteOnAccountChange'
import useFilterState from '../../../hooks/useFilterState'
import useOrderByQuery from '../../../hooks/useOrderByQuery'
import usePaginate from '../../../hooks/usePaginate'
import usePaginateQuery from '../../../hooks/usePaginateQuery'
import LargeLayout from '../../../layouts/large'

type Props = {
  chainId: number
  collectionAddress: string
  currentAccount: string | null
  now: string
  // Currencies
  currencies: Pick<Currency, 'id' | 'image' | 'decimals'>[]
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (ctx, client) => {
    const now = new Date()
    const chainIdStr = ctx.params?.chainId
      ? Array.isArray(ctx.params.chainId)
        ? ctx.params.chainId[0]
        : ctx.params.chainId
      : null
    invariant(chainIdStr, 'chainId is required')
    const chainId = parseInt(chainIdStr, 10)
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

    const currencyId =
      ctx.query.currencyId && !Array.isArray(ctx.query.currencyId)
        ? ctx.query.currencyId
        : null
    const minPrice =
      ctx.query.minPrice && !Array.isArray(ctx.query.minPrice)
        ? parseFloat(ctx.query.minPrice)
        : null
    const maxPrice =
      ctx.query.maxPrice && !Array.isArray(ctx.query.maxPrice)
        ? parseFloat(ctx.query.maxPrice)
        : null
    const offers = ctx.query.offers
      ? Array.isArray(ctx.query.offers)
        ? ((ctx.query.offers[0] || null) as OfferFilter | null)
        : (ctx.query.offers as OfferFilter)
      : null
    const traits = extractTraitsFromQuery(ctx.query)

    const {
      data: { currencies },
    } = await client.query<FetchCurrenciesQuery>({
      query: FetchCurrenciesDocument,
    })

    const { data: collectionDetailsData, error: collectionDetailsError } =
      await client.query<
        FetchCollectionDetailsQuery,
        FetchCollectionDetailsQueryVariables
      >({
        query: FetchCollectionDetailsDocument,
        variables: {
          collectionAddress: collectionAddress,
          chainId: chainId,
        },
      })

    const filter = convertFilterToAssetFilter(
      {
        currencyId,
        maxPrice,
        minPrice,
        offers,
        traits,
        collection: null,
        search: null,
      },
      currencies?.nodes || [],
      now,
    )

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
          collectionAddress: collectionAddress,
          chainId: chainId,
          orderBy,
          filter,
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
        chainId,
        collectionAddress: collectionAddress,
        currentAccount: ctx.user.address,
        now: now.toJSON(),
        currencies: currencies?.nodes || [],
      },
    }
  },
)

const CollectionPage: FC<Props> = ({
  chainId,
  collectionAddress,
  now,
  currentAccount,
  currencies,
}) => {
  const ready = useEagerConnect()
  const { query, push, pathname } = useRouter()
  const isSmall = useBreakpointValue({ base: true, md: false })
  const { t } = useTranslation('templates')
  const date = useMemo(() => new Date(now), [now])
  const { account } = useWeb3React()
  const { data: collectionData } = useFetchCollectionDetailsQuery({
    variables: {
      collectionAddress: collectionAddress,
      chainId: chainId,
    },
  })
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<AssetsOrderBy>(
    'SALES_MIN_UNIT_PRICE_IN_REF_ASC',
  )
  const filter = useAssetFilterFromQuery(currencies)
  const { data, refetch } = useFetchCollectionAssetsQuery({
    variables: {
      collectionAddress,
      now: date,
      currentAccount: (ready ? account?.toLowerCase() : currentAccount) || '',
      limit,
      offset,
      orderBy,
      chainId: chainId,
      filter: convertFilterToAssetFilter(filter, currencies, date),
    },
  })
  useExecuteOnAccountChange(refetch, ready)

  const { showFilters, toggleFilters, close, count } = useFilterState(filter)
  const updateFilter = useCallback(
    async (filter: Filter) => {
      const { traits, ...otherFilters } = filter
      const cleanData = removeEmptyFromObject({
        ...Object.keys(query).reduce((acc, value) => {
          if (value.startsWith('trait')) return acc
          return { ...acc, [value]: query[value] }
        }, {}),
        ...otherFilters,
        page: 1,
        ...traits.reduce(
          (acc, { type, values }) => ({
            ...acc,
            [`traits[${type}]`]: values,
          }),
          {},
        ),
      })
      await push({ pathname, query: cleanData }, undefined, { shallow: true })
    },
    [push, pathname, query],
  )

  const collectionDetails = useMemo(
    () =>
      collectionData?.collection
        ? convertCollectionFull(collectionData.collection)
        : null,
    [collectionData],
  )

  const changeOrder = useCallback(
    async (orderBy: any) => {
      await push(
        { pathname, query: { ...query, orderBy, page: undefined } },
        undefined,
        { shallow: true },
      )
    },
    [push, pathname, query],
  )

  const [changePage, changeLimit] = usePaginate()
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

      <Flex py="6" justifyContent="space-between">
        <FilterNav
          showFilters={showFilters}
          toggleFilters={toggleFilters}
          count={count}
          onClear={() => updateFilter(NoFilter)}
        />
        <Box>
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
      </Flex>

      {isSmall && (
        <Modal isOpen={showFilters} onClose={close} size="full">
          <ModalContent rounded="none">
            <ModalHeader>{t('collection.filter')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FilterAsset
                currencies={currencies}
                onFilterChange={updateFilter}
                filter={filter}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      <Grid gap="6" templateColumns={{ base: '1fr', md: '1fr 3fr' }}>
        {showFilters && (
          <GridItem as="aside">
            <FilterAsset
              currencies={currencies}
              selectedCollection={collectionDetails}
              onFilterChange={updateFilter}
              filter={filter}
            />
          </GridItem>
        )}
        <GridItem gap={6} colSpan={showFilters ? 1 : 2}>
          {data?.assets?.totalCount && data?.assets?.totalCount > 0 ? (
            <SimpleGrid
              flexWrap="wrap"
              spacing="4"
              columns={
                showFilters
                  ? { base: 1, sm: 2, md: 3, lg: 4 }
                  : { base: 1, sm: 2, md: 4, lg: 6 }
              }
            >
              {data.assets.nodes.map((x, i) => (
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
            mt="6"
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
                  components={[
                    <Text as="span" color="brand.black" key="text" />,
                  ]}
                />
              ),
              pages: (props) =>
                t('pagination.result.pages', { count: props.total }),
            }}
          />
        </GridItem>
      </Grid>
    </LargeLayout>
  )
}

export default CollectionPage
