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
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { FC, useCallback, useMemo } from 'react'
import CollectionHeader from '../../../../components/Collection/CollectionHeader'
import CollectionHeaderSkeleton from '../../../../components/Collection/CollectionHeaderSkeleton'
import CollectionMetrics from '../../../../components/Collection/CollectionMetrics'
import CollectionMetricsSkeleton from '../../../../components/Collection/CollectionMetricsSkeleton'
import Empty from '../../../../components/Empty/Empty'
import FilterAsset, {
  NoFilter,
} from '../../../../components/Filter/FilterAsset'
import FilterNav from '../../../../components/Filter/FilterNav'
import Head from '../../../../components/Head'
import Pagination from '../../../../components/Pagination/Pagination'
import Select from '../../../../components/Select/Select'
import SkeletonGrid from '../../../../components/Skeleton/Grid'
import SkeletonTokenCard from '../../../../components/Skeleton/TokenCard'
import TokenCard from '../../../../components/Token/Card'
import {
  AssetsOrderBy,
  useFetchCollectionAssetsQuery,
  useFetchCollectionDetailsQuery,
  useFetchCollectionMetricsQuery,
} from '../../../../graphql'
import useAccount from '../../../../hooks/useAccount'
import useAssetFilterFromQuery, {
  Filter,
  convertFilterToAssetFilter,
} from '../../../../hooks/useAssetFilterFromQuery'
import useAssetFilterState from '../../../../hooks/useAssetFilterState'
import useEnvironment from '../../../../hooks/useEnvironment'
import useOrderByQuery from '../../../../hooks/useOrderByQuery'
import usePaginate from '../../../../hooks/usePaginate'
import usePaginateQuery from '../../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../../hooks/useRequiredQueryParamSingle'
import LargeLayout from '../../../../layouts/large'
import { removeEmptyFromObject } from '../../../../utils'
import Error from '../../../_error'

type Props = {
  now: string
}

const CollectionPage: FC<Props> = ({ now }) => {
  const { PAGINATION_LIMIT } = useEnvironment()
  const { query, push, pathname } = useRouter()
  const chainId = useRequiredQueryParamSingle<number>('chainId', {
    parse: parseInt,
  })
  const collectionAddress = useRequiredQueryParamSingle('id')
  const isSmall = useBreakpointValue(
    { base: true, md: false },
    { fallback: 'md' },
  )
  const { t } = useTranslation('templates')
  const date = useMemo(() => new Date(now), [now])
  const { address } = useAccount()
  const { data: collectionData } = useFetchCollectionDetailsQuery({
    variables: {
      collectionAddress,
      chainId,
    },
  })
  const collection = collectionData?.collection

  const { data: collectionMetricsData } = useFetchCollectionMetricsQuery({
    variables: {
      collectionAddress,
      chainId,
    },
  })
  const metrics = collectionMetricsData?.collection

  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<AssetsOrderBy>('BEST_PRICE_ASC')
  const filter = useAssetFilterFromQuery()
  const { data: assetData } = useFetchCollectionAssetsQuery({
    variables: {
      collectionAddress,
      now: date,
      currentAccount: address || '',
      limit,
      offset,
      orderBy,
      chainId: chainId,
      filter: convertFilterToAssetFilter(filter, date),
    },
  })
  const assets = assetData?.assets?.nodes

  const { showFilters, toggleFilters, close, count } =
    useAssetFilterState(filter)
  const updateFilter = useCallback(
    async (filter: Filter) => {
      const {
        traits,
        currency,
        collectionSearch, // exclude from query
        propertySearch, // exclude from query
        ...otherFilters
      } = filter
      const cleanData = removeEmptyFromObject({
        ...Object.keys(query).reduce((acc, value) => {
          if (value.startsWith('trait')) return acc
          return { ...acc, [value]: query[value] }
        }, {}),
        ...otherFilters,
        currency: currency?.id,
        decimals: currency?.decimals,
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

  const { changeLimit } = usePaginate()

  if (collection === null || collection?.deletedAt)
    return <Error statusCode={404} />
  return (
    <LargeLayout>
      <Head
        title={collection?.name}
        description={collection?.description || undefined}
        image={collection?.image || undefined}
      />

      {!collection ? (
        <CollectionHeaderSkeleton />
      ) : (
        <CollectionHeader collection={collection} />
      )}

      {!metrics ? (
        <CollectionMetricsSkeleton />
      ) : (
        <CollectionMetrics chainId={chainId} metrics={metrics} />
      )}

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
                label: t('collection.orderBy.values.priceAsc'),
                value: 'BEST_PRICE_ASC',
              },
              {
                label: t('collection.orderBy.values.priceDesc'),
                value: 'BEST_PRICE_DESC',
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
                noChain
                currentCollection={collection}
                onFilterChange={updateFilter}
                filter={{
                  ...filter,
                  chains: collection ? [collection.chainId] : [],
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      <Grid gap="6" templateColumns={{ base: '1fr', md: '1fr 3fr' }}>
        {showFilters && (
          <GridItem as="aside" overflow="hidden">
            <FilterAsset
              noChain
              currentCollection={collection}
              onFilterChange={updateFilter}
              filter={{
                ...filter,
                chains: collection ? [collection.chainId] : [],
              }}
            />
          </GridItem>
        )}
        <GridItem gap={6} colSpan={showFilters ? 1 : 2}>
          {assets === undefined ? (
            <SkeletonGrid
              items={PAGINATION_LIMIT}
              compact
              columns={
                showFilters
                  ? { base: 1, sm: 2, md: 3, lg: 4 }
                  : { base: 1, sm: 2, md: 4, lg: 6 }
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
                  ? { base: 1, sm: 2, md: 3, lg: 4 }
                  : { base: 1, sm: 2, md: 4, lg: 6 }
              }
            >
              {assets.map((asset, i) => (
                <Flex key={i} justify="center" overflow="hidden">
                  <TokenCard asset={asset} />
                </Flex>
              ))}
            </SimpleGrid>
          ) : (
            <Empty
              title={t('collection.empty.title')}
              description={t('collection.empty.description')}
            />
          )}
          <Divider my="6" display={assets?.length !== 0 ? 'block' : 'none'} />
          {assets?.length !== 0 && (
            <Pagination
              limit={limit}
              limits={[PAGINATION_LIMIT, 24, 36, 48]}
              page={page}
              onLimitChange={changeLimit}
              hasNextPage={assetData?.assets?.pageInfo.hasNextPage}
              hasPreviousPage={assetData?.assets?.pageInfo.hasPreviousPage}
            />
          )}
        </GridItem>
      </Grid>
    </LargeLayout>
  )
}

export default CollectionPage
