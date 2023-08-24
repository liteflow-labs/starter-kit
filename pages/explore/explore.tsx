import {
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  SimpleGrid,
  useBreakpointValue,
} from '@chakra-ui/react'
import { NextPage } from 'next'
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
import SkeletonGrid from '../../components/Skeleton/Grid'
import SkeletonTokenCard from '../../components/Skeleton/TokenCard'
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
  Filter,
  convertFilterToAssetFilter,
} from '../../hooks/useAssetFilterFromQuery'
import useAssetFilterState from '../../hooks/useAssetFilterState'
import useOrderByQuery from '../../hooks/useOrderByQuery'
import usePaginate from '../../hooks/usePaginate'
import usePaginateQuery from '../../hooks/usePaginateQuery'
import { removeEmptyFromObject } from '../../utils'

type Props = {
  now: string
}

const ExplorePage: NextPage<Props> = ({ now }) => {
  const { query, pathname, push } = useRouter()
  const isSmall = useBreakpointValue(
    { base: true, md: false },
    { fallback: 'md' },
  )
  const { t } = useTranslation('templates')
  const date = useMemo(() => new Date(now), [now])
  const { address } = useAccount()
  const filter = useAssetFilterFromQuery()
  const orderBy = useOrderByQuery<AssetsOrderBy>('CREATED_AT_DESC')
  const { page, limit, offset } = usePaginateQuery()
  const { data: assetsData } = useFetchAllErc721And1155Query({
    variables: {
      now: date,
      address: address || '',
      limit,
      offset,
      orderBy,
      filter: convertFilterToAssetFilter(filter, date),
    },
  })

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

  const assets = assetsData?.assets?.nodes

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

  return (
    <>
      <Head title={t('explore.title')} />

      <ExploreTemplate
        title={t('explore.title')}
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
              {assets === undefined ? (
                <SkeletonGrid
                  items={environment.PAGINATION_LIMIT}
                  compact
                  columns={
                    showFilters
                      ? { sm: 2, md: 3, lg: 4 }
                      : { sm: 2, md: 4, lg: 6 }
                  }
                >
                  <SkeletonTokenCard />
                </SkeletonGrid>
              ) : assets.length > 0 ? (
                <SimpleGrid
                  flexWrap="wrap"
                  spacing="4"
                  columns={
                    showFilters
                      ? { sm: 2, md: 3, lg: 4 }
                      : { sm: 2, md: 4, lg: 6 }
                  }
                >
                  {assets.map((x, i) => (
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
                          x.firstSale.totalCurrencyDistinctCount > 1
                        }
                      />
                    </Flex>
                  ))}
                </SimpleGrid>
              ) : (
                <Empty
                  title={t('explore.nfts.empty.title')}
                  description={t('explore.nfts.empty.description')}
                />
              )}
              <Divider
                my="6"
                display={assets?.length !== 0 ? 'block' : 'none'}
              />
              {assets?.length !== 0 && (
                <Pagination
                  limit={limit}
                  limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
                  page={page}
                  onPageChange={changePage}
                  onLimitChange={changeLimit}
                  hasNextPage={assetsData?.assets?.pageInfo.hasNextPage}
                  hasPreviousPage={assetsData?.assets?.pageInfo.hasPreviousPage}
                />
              )}
            </GridItem>
          </Grid>
        </>
      </ExploreTemplate>
    </>
  )
}

export default ExplorePage
