import {
  Box,
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
import { AssetsOrderBy, useFetchAllErc721And1155Query } from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useAssetFilterFromQuery, {
  convertFilterToAssetFilter,
  Filter,
} from '../../hooks/useAssetFilterFromQuery'
import useAssetFilterState from '../../hooks/useAssetFilterState'
import useEagerConnect from '../../hooks/useEagerConnect'
import useOrderByQuery from '../../hooks/useOrderByQuery'
import usePaginate from '../../hooks/usePaginate'
import usePaginateQuery from '../../hooks/usePaginateQuery'

type Props = {
  now: string
}

const ExplorePage: NextPage<Props> = ({ now }) => {
  useEagerConnect()
  const { query, pathname, push } = useRouter()
  const isSmall = useBreakpointValue({ base: true, md: false })
  const { t } = useTranslation('templates')
  const date = useMemo(() => new Date(now), [now])
  const { address } = useAccount()
  const filter = useAssetFilterFromQuery()
  const orderBy = useOrderByQuery<AssetsOrderBy>('CREATED_AT_DESC')
  const { page, limit, offset } = usePaginateQuery()
  const { data, previousData, loading } = useFetchAllErc721And1155Query({
    variables: {
      now: date,
      address: address || '',
      limit,
      offset,
      orderBy,
      filter: convertFilterToAssetFilter(filter, date),
    },
  })

  const assets = useMemo(() => {
    if (loading) return previousData?.assets
    return data?.assets
  }, [data?.assets, loading, previousData])

  const { showFilters, toggleFilters, close, count } =
    useAssetFilterState(filter)

  const updateFilter = useCallback(
    async (filter: Filter) => {
      const { traits, currency, ...otherFilters } = filter
      const cleanData = removeEmptyFromObject({
        ...Object.keys(query).reduce((acc, value) => {
          if (value.startsWith('trait')) return acc
          return { ...acc, [value]: query[value] }
        }, {}),
        currency: currency?.id,
        decimals: currency?.decimals,
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

  return (
    <>
      <Head title={t('explore.title')} />

      <ExploreTemplate
        title={t('explore.title')}
        loading={pageLoading || loading}
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
                  <FilterAsset onFilterChange={updateFilter} filter={filter} />
                </ModalBody>
              </ModalContent>
            </Modal>
          )}
          <Grid gap="4" templateColumns={{ base: '1fr', md: '1fr 3fr' }}>
            {showFilters && !isSmall && (
              <GridItem as="aside">
                <FilterAsset onFilterChange={updateFilter} filter={filter} />
              </GridItem>
            )}
            <GridItem gap={6} colSpan={showFilters ? 1 : 2}>
              {assets?.totalCount && assets?.totalCount > 0 ? (
                <SimpleGrid
                  flexWrap="wrap"
                  spacing="4"
                  columns={
                    showFilters
                      ? { base: 1, sm: 2, md: 3, lg: 4 }
                      : { base: 1, sm: 2, md: 4, lg: 6 }
                  }
                >
                  {assets?.nodes.map((x, i) => (
                    <Flex key={i} justify="center" overflow="hidden">
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
              <Box mt="6" py="6" borderTop="1px" borderColor="gray.200">
                <Pagination
                  limit={limit}
                  limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
                  page={page}
                  total={assets?.totalCount}
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
              </Box>
            </GridItem>
          </Grid>
        </>
      </ExploreTemplate>
    </>
  )
}

export default ExplorePage
