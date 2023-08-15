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
  Spacer,
  useBreakpointValue,
  useToast,
} from '@chakra-ui/react'
import CollectionCard from 'components/Collection/CollectionCard'
import ExploreTemplate from 'components/Explore'
import Head from 'components/Head'
import { convertCollection } from 'convert'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import Empty from '../../components/Empty/Empty'
import FilterCollection, {
  NoFilter,
} from '../../components/Filter/FilterCollection'
import FilterNav from '../../components/Filter/FilterNav'
import Pagination from '../../components/Pagination/Pagination'
import Select from '../../components/Select/Select'
import SkeletonCollectionCard from '../../components/Skeleton/CollectionCard'
import SkeletonGrid from '../../components/Skeleton/Grid'
import { chains } from '../../connectors'
import environment from '../../environment'
import {
  CollectionsOrderBy,
  useFetchExploreCollectionsQuery,
} from '../../graphql'
import useCollectionFilterFromQuery, {
  Filter,
  convertFilterToCollectionFilter,
} from '../../hooks/useCollectionFilterFromQuery'
import useCollectionFilterState from '../../hooks/useCollectionFilterState'
import useOrderByQuery from '../../hooks/useOrderByQuery'
import usePaginate from '../../hooks/usePaginate'
import usePaginateQuery from '../../hooks/usePaginateQuery'
import { formatError, removeEmptyFromObject } from '../../utils'

type Props = {}

const CollectionsPage: NextPage<Props> = ({}) => {
  const { pathname, push, query, replace } = useRouter()
  const isSmall = useBreakpointValue(
    { base: true, md: false },
    { fallback: 'md' },
  )
  const { t } = useTranslation('templates')
  const toast = useToast()
  const { limit, offset, page } = usePaginateQuery()
  const filter = useCollectionFilterFromQuery()
  const orderBy = useOrderByQuery<CollectionsOrderBy>('TOTAL_VOLUME_DESC')
  const { data: collectionsData } = useFetchExploreCollectionsQuery({
    variables: {
      limit,
      offset,
      orderBy,
      filter: convertFilterToCollectionFilter(filter),
    },
  })

  const { showFilters, toggleFilters, close, count } =
    useCollectionFilterState(filter)

  const updateFilter = useCallback(
    async (filter: Filter) => {
      const cleanData = removeEmptyFromObject({
        ...filter,
        search: filter.search,
        page: 1,
      })
      await push({ pathname, query: cleanData }, undefined, { shallow: true })
    },
    [push, pathname],
  )

  const collections = collectionsData?.collections?.nodes
  const hasFilter = chains.length > 1

  const [changePage, changeLimit] = usePaginate()

  const changeOrder = useCallback(
    async (orderBy: any) => {
      try {
        await replace({
          pathname,
          query: { ...query, orderBy, page: undefined },
        })
      } catch (e) {
        toast({
          title: formatError(e),
          status: 'error',
        })
      }
    },
    [replace, pathname, query, toast],
  )

  return (
    <>
      <Head title={t('explore.title')} />

      <ExploreTemplate
        title={t('explore.title')}
        search={filter.search}
        selectedTabIndex={1}
      >
        <>
          <Flex py="6" justifyContent="space-between">
            {hasFilter ? (
              <FilterNav
                showFilters={showFilters}
                toggleFilters={toggleFilters}
                count={count}
                onClear={() => updateFilter(NoFilter)}
              />
            ) : (
              <Spacer />
            )}
            <Box>
              <Select<CollectionsOrderBy>
                name="orderBy"
                onChange={changeOrder}
                choices={[
                  {
                    label: t('explore.collections.orderBy.values.24hVolDesc'),
                    value: 'TOTAL_VOLUME_LAST_24H_DESC',
                  },
                  {
                    label: t('explore.collections.orderBy.values.7dVolDesc'),
                    value: 'TOTAL_VOLUME_LAST_7D_DESC',
                  },
                  {
                    label: t('explore.collections.orderBy.values.14dVolDesc'),
                    value: 'TOTAL_VOLUME_LAST_14D_DESC',
                  },
                  {
                    label: t('explore.collections.orderBy.values.28dVolDesc'),
                    value: 'TOTAL_VOLUME_LAST_28D_DESC',
                  },
                  {
                    label: t('explore.collections.orderBy.values.totalVolDesc'),
                    value: 'TOTAL_VOLUME_DESC',
                  },
                ]}
                value={orderBy}
              />
            </Box>
          </Flex>
          {hasFilter && isSmall && (
            <Modal isOpen={showFilters} onClose={close} size="full">
              <ModalContent rounded="none">
                <ModalHeader>{t('explore.nfts.filter')}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FilterCollection
                    onFilterChange={updateFilter}
                    filter={filter}
                  />
                </ModalBody>
              </ModalContent>
            </Modal>
          )}
          <Grid gap="4" templateColumns={{ base: '1fr', md: '1fr 3fr' }}>
            {hasFilter && showFilters && !isSmall && (
              <GridItem as="aside">
                <FilterCollection
                  onFilterChange={updateFilter}
                  filter={filter}
                />
              </GridItem>
            )}
            <GridItem gap={6} colSpan={hasFilter && showFilters ? 1 : 2}>
              {collections === undefined ? (
                <SkeletonGrid
                  items={environment.PAGINATION_LIMIT}
                  compact
                  columns={
                    showFilters
                      ? { sm: 2, md: 3, lg: 4 }
                      : { sm: 2, md: 4, lg: 6 }
                  }
                >
                  <SkeletonCollectionCard />
                </SkeletonGrid>
              ) : collections.length > 0 ? (
                <SimpleGrid
                  flexWrap="wrap"
                  spacing="4"
                  columns={
                    hasFilter && showFilters
                      ? { sm: 2, md: 3, lg: 4 }
                      : { sm: 2, md: 4, lg: 6 }
                  }
                >
                  {collections.map((collection, i) => (
                    <CollectionCard
                      collection={convertCollection(collection)}
                      key={i}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Empty
                  title={t('explore.collections.empty.title')}
                  description={t('explore.collections.empty.description')}
                />
              )}
              <Divider
                my="6"
                display={collections?.length !== 0 ? 'block' : 'none'}
              />
              {collections?.length !== 0 && (
                <Pagination
                  limit={limit}
                  limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
                  page={page}
                  onPageChange={changePage}
                  onLimitChange={changeLimit}
                  hasNextPage={
                    collectionsData?.collections?.pageInfo.hasNextPage
                  }
                  hasPreviousPage={
                    collectionsData?.collections?.pageInfo.hasPreviousPage
                  }
                />
              )}
            </GridItem>
          </Grid>
        </>
      </ExploreTemplate>
    </>
  )
}

export default CollectionsPage
