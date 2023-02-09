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
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import Empty from '../../components/Empty/Empty'
import ExploreTemplate from '../../components/Explore'
import FilterAsset, { NoFilter } from '../../components/Filter/FilterAsset'
import FilterNav from '../../components/Filter/FilterNav'
import Head from '../../components/Head'
import Pagination from '../../components/Pagination/Pagination'
import Select from '../../components/Select/Select'
import TokenCard from '../../components/Token/Card'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertSale,
  convertUser,
} from '../../convert'
import environment from '../../environment'
import {
  AssetsOrderBy,
  Currency,
  FetchAllErc721And1155Document,
  FetchAllErc721And1155Query,
  FetchCurrenciesDocument,
  FetchCurrenciesQuery,
  useFetchAllErc721And1155Query,
} from '../../graphql'
import useAssetFilterFromQuery, {
  convertFilterToAssetFilter,
  extractTraitsFromQuery,
  Filter,
  OfferFilter,
} from '../../hooks/useAssetFilterFromQuery'
import useEagerConnect from '../../hooks/useEagerConnect'
import useExecuteOnAccountChange from '../../hooks/useExecuteOnAccountChange'
import useFilterState from '../../hooks/useFilterState'
import useOrderByQuery from '../../hooks/useOrderByQuery'
import usePaginate from '../../hooks/usePaginate'
import usePaginateQuery from '../../hooks/usePaginateQuery'
import { wrapServerSideProps } from '../../props'

type Props = {
  currentAccount: string | null
  now: string
  // Currencies
  currencies: Pick<Currency, 'id' | 'image' | 'decimals'>[]
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (ctx, client) => {
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
      : (ctx.query.orderBy as AssetsOrderBy) || 'CREATED_AT_DESC'
    const search =
      ctx.query.search && !Array.isArray(ctx.query.search)
        ? ctx.query.search
        : null
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
    const collection = ctx.query.collection
      ? Array.isArray(ctx.query.collection)
        ? ctx.query.collection[0] || null
        : ctx.query.collection || null
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
    const now = new Date()
    const filter = convertFilterToAssetFilter(
      { search, collection, currencyId, maxPrice, minPrice, offers, traits },
      currencies?.nodes || [],
      now,
    )

    const { data, error } = await client.query<FetchAllErc721And1155Query>({
      query: FetchAllErc721And1155Document,
      variables: {
        now,
        address: ctx.user.address || '',
        limit,
        offset,
        orderBy,
        filter,
      },
    })
    if (error) throw error
    if (!data) throw new Error('data is falsy')
    return {
      props: {
        currentAccount: ctx.user.address,
        now: now.toJSON(),
        currencies: currencies?.nodes || [],
      },
    }
  },
)

const ExplorePage: NextPage<Props> = ({ currentAccount, now, currencies }) => {
  const ready = useEagerConnect()
  const { query, pathname, push } = useRouter()
  const isSmall = useBreakpointValue({ base: true, md: false })
  const { t } = useTranslation('templates')
  const date = useMemo(() => new Date(now), [now])
  const { account } = useWeb3React()
  const filter = useAssetFilterFromQuery(currencies)
  const orderBy = useOrderByQuery<AssetsOrderBy>('CREATED_AT_DESC')
  const { page, limit, offset } = usePaginateQuery()
  const { data, refetch } = useFetchAllErc721And1155Query({
    variables: {
      now: date,
      address: (ready ? account?.toLowerCase() : currentAccount) || '',
      limit,
      offset,
      orderBy,
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
        search: filter.search,
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

  const [changePage, changeLimit, { loading: pageLoading }] = usePaginate()
  const ChakraPagination = chakra(Pagination)

  return (
    <>
      <Head title={t('explore.title')} />

      <ExploreTemplate
        title={t('explore.title')}
        loading={pageLoading}
        search={filter.search}
        selectedTabIndex={0}
      >
        <>
          <Flex py="6" justifyContent="space-between">
            <FilterNav
              showFilters={showFilters}
              toggleFilters={toggleFilters}
              count={count}
              onClear={() => updateFilter(NoFilter)}
            />
            <Box>
              <Select<AssetsOrderBy>
                label={isSmall ? undefined : t('explore.nfts.orderBy.label')}
                name="orderBy"
                onChange={changeOrder}
                choices={[
                  {
                    label: t('explore.nfts.orderBy.values.createdAtDesc'),
                    value: 'CREATED_AT_DESC',
                  },
                  {
                    label: t('explore.nfts.orderBy.values.createdAtAsc'),
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
                <ModalHeader>{t('explore.nfts.filter')}</ModalHeader>
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
          <Grid gap="4" templateColumns={{ base: '1fr', md: '1fr 3fr' }}>
            {showFilters && !isSmall && (
              <GridItem as="aside">
                <FilterAsset
                  currencies={currencies}
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
                            x.currencySales.aggregates?.distinctCount
                              ?.currencyId,
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
                    title={t('explore.nfts.empty.title')}
                    description={t('explore.nfts.empty.description')}
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
        </>
      </ExploreTemplate>
    </>
  )
}

export default ExplorePage
