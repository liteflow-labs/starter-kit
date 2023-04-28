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
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { FC, useCallback, useMemo } from 'react'
import CollectionHeader from '../../../components/Collection/CollectionHeader'
import Empty from '../../../components/Empty/Empty'
import FilterAsset, { NoFilter } from '../../../components/Filter/FilterAsset'
import FilterNav from '../../../components/Filter/FilterNav'
import Head from '../../../components/Head'
import Loader from '../../../components/Loader'
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
  useFetchCollectionAssetsQuery,
  useFetchCollectionDetailsQuery,
} from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useAssetFilterFromQuery, {
  convertFilterToAssetFilter,
  Filter,
} from '../../../hooks/useAssetFilterFromQuery'
import useAssetFilterState from '../../../hooks/useAssetFilterState'
import useEagerConnect from '../../../hooks/useEagerConnect'
import useOrderByQuery from '../../../hooks/useOrderByQuery'
import usePaginate from '../../../hooks/usePaginate'
import usePaginateQuery from '../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import LargeLayout from '../../../layouts/large'

type Props = {
  now: string
}

const CollectionPage: FC<Props> = ({ now }) => {
  useEagerConnect()
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
  const { data, loading: assetLoading } = useFetchCollectionAssetsQuery({
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

  if (loading) return <Loader fullPage />
  if (!collectionDetails) return null
  return (
    <LargeLayout>
      <Head title="Explore collection" />

      <CollectionHeader
        collection={collectionDetails}
        baseURL={environment.BASE_URL}
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
              <FilterAsset onFilterChange={updateFilter} filter={filter} />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      <Grid gap="6" templateColumns={{ base: '1fr', md: '1fr 3fr' }}>
        {showFilters && (
          <GridItem as="aside">
            <FilterAsset
              selectedCollection={collectionDetails}
              onFilterChange={updateFilter}
              filter={filter}
            />
          </GridItem>
        )}
        <GridItem gap={6} colSpan={showFilters ? 1 : 2}>
          {assetLoading && <Loader />}
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
          <Box mt="6" py="6" borderTop="1px" borderColor="gray.200">
            <Pagination
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
          </Box>
        </GridItem>
      </Grid>
    </LargeLayout>
  )
}

export default CollectionPage
