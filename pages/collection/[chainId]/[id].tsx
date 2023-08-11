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
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { FC, useCallback, useMemo } from 'react'
import CollectionHeader from '../../../components/Collection/CollectionHeader'
import Empty from '../../../components/Empty/Empty'
import FilterAsset, { NoFilter } from '../../../components/Filter/FilterAsset'
import FilterNav from '../../../components/Filter/FilterNav'
import Head from '../../../components/Head'
import Pagination from '../../../components/Pagination/Pagination'
import Select from '../../../components/Select/Select'
import SkeletonGrid from '../../../components/Skeleton/Grid'
import SkeletonTokenCard from '../../../components/Skeleton/TokenCard'
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
  useFetchCollectionAssetsQuery,
  useFetchCollectionDetailsQuery,
} from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useAssetFilterFromQuery, {
  Filter,
  convertFilterToAssetFilter,
} from '../../../hooks/useAssetFilterFromQuery'
import useAssetFilterState from '../../../hooks/useAssetFilterState'
import useOrderByQuery from '../../../hooks/useOrderByQuery'
import usePaginate from '../../../hooks/usePaginate'
import usePaginateQuery from '../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import LargeLayout from '../../../layouts/large'
import { removeEmptyFromObject } from '../../../utils'

type Props = {
  now: string
}

const CollectionPage: FC<Props> = ({ now }) => {
  const { query, push, pathname } = useRouter()
  const chainId = useRequiredQueryParamSingle<number>('chainId', {
    parse: parseInt,
  })
  const collectionAddress = useRequiredQueryParamSingle('id')
  const isSmall = useBreakpointValue({ base: true, md: false })
  const { t } = useTranslation('templates')
  const date = useMemo(() => new Date(now), [now])
  const { address } = useAccount()
  const { data: collectionData, loading } = useFetchCollectionDetailsQuery({
    variables: {
      collectionAddress: collectionAddress,
      chainId: chainId,
    },
  })
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<AssetsOrderBy>(
    'SALES_MIN_UNIT_PRICE_IN_REF_ASC',
  )
  const filter = useAssetFilterFromQuery()
  const { data: assetData, loading: _assetLoading } =
    useFetchCollectionAssetsQuery({
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
  const assetLoading = _assetLoading && !assetData
  const totalCount = assetData?.assets?.totalCount

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

  if (!loading && !collectionDetails) return <Error statusCode={404} />
  return (
    <LargeLayout>
      <Head title="Explore collection" />

      <CollectionHeader
        collection={collectionDetails || {}}
        loading={loading && !collectionDetails}
        reportEmail={environment.REPORT_EMAIL}
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
                noChain
                selectedCollection={{ chainId, address: collectionAddress }}
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
              noChain
              selectedCollection={{ chainId, address: collectionAddress }}
              onFilterChange={updateFilter}
              filter={filter}
            />
          </GridItem>
        )}
        <GridItem gap={6} colSpan={showFilters ? 1 : 2}>
          {assetLoading ? (
            <SkeletonGrid
              items={environment.PAGINATION_LIMIT}
              compact
              columns={
                showFilters
                  ? { base: 1, sm: 2, md: 3, lg: 4 }
                  : { base: 1, sm: 2, md: 4, lg: 6 }
              }
            >
              <SkeletonTokenCard />
            </SkeletonGrid>
          ) : totalCount === 0 ? (
            <Empty
              title={t('collection.empty.title')}
              description={t('collection.empty.description')}
            />
          ) : (
            <SimpleGrid
              flexWrap="wrap"
              spacing="4"
              columns={
                showFilters
                  ? { base: 1, sm: 2, md: 3, lg: 4 }
                  : { base: 1, sm: 2, md: 4, lg: 6 }
              }
            >
              {assetData?.assets?.nodes.map((x, i) => (
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
          )}
          <Divider my="6" display={totalCount === 0 ? 'none' : 'block'} />
          <Pagination
            limit={limit}
            limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
            page={page}
            total={totalCount}
            isLoading={assetLoading}
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
