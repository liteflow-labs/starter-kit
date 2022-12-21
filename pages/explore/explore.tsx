import {
  Box,
  Button,
  chakra,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  InputGroup,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { parsePrice, removeEmptyFromObject } from '@nft/hooks'
import ExploreTemplate from 'components/Explore'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import Empty from '../../components/Empty/Empty'
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
  AssetFilter,
  AssetsOrderBy,
  AssetToManyAuctionFilter,
  AssetToManyOfferOpenSaleFilter,
  AuctionFilter,
  DatetimeFilter,
  FetchAllErc721And1155Document,
  FetchAllErc721And1155Query,
  FetchCurrencyDecimalsDocument,
  FetchCurrencyDecimalsQuery,
  OfferOpenSaleFilter,
  Uint256Filter,
  useFetchAllErc721And1155Query,
} from '../../graphql'
import useEagerConnect from '../../hooks/useEagerConnect'
import useExecuteOnAccountChange from '../../hooks/useExecuteOnAccountChange'
import usePaginate from '../../hooks/usePaginate'
import { wrapServerSideProps } from '../../props'
import { values as traits } from '../../traits'

type Props = {
  now: string
  traits: { [key: string]: string[] }
  // Pagination
  limit: number
  page: number
  offset: number
  // Filters
  queryFilter: AssetFilter[]
  filter: {
    minPrice: number | null
    maxPrice: number | null
    categories: string[] | null
    collections: string[] | null
    offers: OfferFilter[] | null
    currencyId: string | null
  }
  // OrderBy
  orderBy: AssetsOrderBy
  // Search
  search: string | null
}

type FormData = {
  categories: string[] | null
  collections: string[] | null
  offers: string[] | null
  minPrice: number | null
  maxPrice: number | null
  currencyId: string | null
}

const searchFilter = (search: string): AssetFilter =>
  ({
    or: [
      { name: { includesInsensitive: search } } as AssetFilter,
      { description: { includesInsensitive: search } } as AssetFilter,
      { creatorAddress: { includesInsensitive: search } } as AssetFilter,
    ],
  } as AssetFilter)

const traitFilter = (trait: string, values: string[]): AssetFilter =>
  ({
    or: [
      {
        traits: {
          some: {
            type: { equalTo: trait },
            value: { in: values },
          },
        },
      } as AssetFilter,
    ],
  } as AssetFilter)

const collectionFilter = (collections: string[]): AssetFilter => {
  return {
    or: [
      {
        collection: {
          or: collections.map((collection) => {
            // split the collection string to extract chainId and address
            const [chainId, address] = collection.split('-')
            return {
              chainId: { equalTo: parseInt(chainId, 10) },
              address: { equalTo: address },
            }
          }),
        },
      },
    ],
  } as AssetFilter
}

const minPriceFilter = (
  minPrice: number,
  currency: { id: string; decimals: number },
  date: Date,
): AssetFilter =>
  ({
    sales: {
      some: {
        expiredAt: { greaterThan: date },
        availableQuantity: { greaterThan: '0' },
        currencyId: { equalTo: currency.id },
        unitPrice: {
          greaterThanOrEqualTo: parsePrice(
            minPrice.toString(),
            currency.decimals,
          ).toString(),
        } as Uint256Filter,
      } as OfferOpenSaleFilter,
    } as AssetToManyOfferOpenSaleFilter,
  } as AssetFilter)

const maxPriceFilter = (
  maxPrice: number,
  currency: { id: string; decimals: number },
  date: Date,
): AssetFilter =>
  ({
    sales: {
      some: {
        expiredAt: { greaterThan: date },
        availableQuantity: { greaterThan: '0' },
        currencyId: { equalTo: currency.id },
        unitPrice: {
          lessThanOrEqualTo: parsePrice(
            maxPrice.toString(),
            currency.decimals,
          ).toString(),
        } as Uint256Filter,
      } as OfferOpenSaleFilter,
    } as AssetToManyOfferOpenSaleFilter,
  } as AssetFilter)

const offersFilter = (offers: OfferFilter[], date: Date): AssetFilter => {
  const filter: AssetFilter = {
    or: [] as AssetFilter[],
  } as AssetFilter
  if (offers.includes(OfferFilter.auction)) {
    filter.or?.push({
      auctions: {
        some: {
          endAt: { greaterThan: date } as DatetimeFilter,
        } as AuctionFilter,
      } as AssetToManyAuctionFilter,
    } as AssetFilter)
  }
  if (offers.includes(OfferFilter.fixed)) {
    filter.or?.push({
      sales: {
        some: {
          expiredAt: { greaterThan: date },
          availableQuantity: { greaterThan: '0' },
        },
      },
    } as AssetFilter)
  }
  return filter
}

enum OfferFilter {
  fixed = 'fixed',
  auction = 'auction',
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (ctx, client) => {
    const limit = ctx.query.limit
      ? Array.isArray(ctx.query.limit)
        ? parseInt(ctx.query.limit[0], 10)
        : parseInt(ctx.query.limit, 10)
      : environment.PAGINATION_LIMIT
    const page = ctx.query.page
      ? Array.isArray(ctx.query.page)
        ? parseInt(ctx.query.page[0], 10)
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
    const categories = ctx.query.categories
      ? !Array.isArray(ctx.query.categories)
        ? [ctx.query.categories]
        : ctx.query.categories
      : null
    const collections = ctx.query.collections
      ? !Array.isArray(ctx.query.collections)
        ? [ctx.query.collections]
        : ctx.query.collections
      : null
    const offers = ctx.query.offers
      ? (!Array.isArray(ctx.query.offers)
          ? [ctx.query.offers]
          : ctx.query.offers
        )
          .filter((offer) => offer in OfferFilter)
          .map((x) => {
            if (x === OfferFilter.fixed) return OfferFilter.fixed
            if (x === OfferFilter.auction) return OfferFilter.auction
            throw new Error('invalid filter')
          })
          .filter(Boolean)
      : null

    const {
      data: { currencies },
    } = await client.query<FetchCurrencyDecimalsQuery>({
      query: FetchCurrencyDecimalsDocument,
    })
    const selectedCurrency =
      currencies?.nodes?.find((x) => x.id === currencyId) ||
      currencies?.nodes[0]
    const now = new Date()
    const queryFilter = []
    if (search) queryFilter.push(searchFilter(search))
    if (categories) queryFilter.push(traitFilter('Category', categories))
    if (collections) queryFilter.push(collectionFilter(collections))
    if (selectedCurrency) {
      if (minPrice)
        queryFilter.push(minPriceFilter(minPrice, selectedCurrency, now))
      if (maxPrice)
        queryFilter.push(maxPriceFilter(maxPrice, selectedCurrency, now))
    }
    if (offers) queryFilter.push(offersFilter(offers, now))

    const { data, error } = await client.query<FetchAllErc721And1155Query>({
      query: FetchAllErc721And1155Document,
      variables: { now, limit, offset, orderBy, filter: queryFilter },
    })
    if (error) throw error
    if (!data) throw new Error('data is falsy')
    return {
      props: {
        now: now.toJSON(),
        traits,
        limit,
        page,
        offset,
        orderBy,
        queryFilter,
        filter: {
          minPrice,
          categories,
          collections,
          maxPrice,
          offers,
          currencyId: selectedCurrency?.id || null,
        },
        search,
      },
    }
  },
)

const ExplorePage: NextPage<Props> = ({
  now,
  offset,
  traits,
  limit,
  queryFilter,
  filter,
  search,
  page,
  orderBy,
}) => {
  const ready = useEagerConnect()
  const { t } = useTranslation('templates')
  const date = useMemo(() => new Date(now), [now])
  const { data, refetch } = useFetchAllErc721And1155Query({
    variables: {
      now: date,
      limit,
      offset,
      orderBy,
      filter: queryFilter,
    },
  })
  useExecuteOnAccountChange(refetch, ready)

  const [changePage, changeLimit, { loading: pageLoading }] = usePaginate()

  const { events, query, replace, pathname } = useRouter()

  const {
    register,
    formState: { isSubmitting, errors },
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
  } = useForm<FormData>({
    defaultValues: filter,
  })

  const [loadingOrder, setLoadingOrder] = useState(false)

  const currencyId = watch('currencyId')

  const assets = useMemo(() => data?.assets?.nodes || [], [data])
  const categories = useMemo(() => traits['Category'] || [], [traits])
  const collections = useMemo(() => data?.collections?.nodes || [], [data])
  const currencies = useMemo(() => data?.currencies?.nodes || [], [data])
  const currency = useMemo(
    () => currencies.find((x) => x.id === currencyId),
    [currencies, currencyId],
  )

  const onSubmit = handleSubmit(async (data) => {
    const cleanData = removeEmptyFromObject({
      ...query,
      ...data,
      search,
      page: undefined,
    })
    await replace({ pathname, query: cleanData })
  })

  const changeOrder = useCallback(
    async (orderBy: any) => {
      setLoadingOrder(true)
      try {
        await replace({
          pathname,
          query: { ...query, orderBy, page: undefined },
        })
      } finally {
        setLoadingOrder(false)
      }
    },
    [replace, pathname, query],
  )

  const clearFilters = useCallback(async () => {
    reset()
    const cleanData = removeEmptyFromObject({
      ...query,
      search,
      page: undefined,
      categories: null,
      collections: null,
      offers: null,
      minPrice: null,
      maxPrice: null,
      currencyId: null,
    })
    await replace({ pathname, query: cleanData })
  }, [reset, query, search, replace, pathname])

  const filterButtons = useMemo(() => {
    // TODO: remove the check for currencyId, we need to pass currencyId with a 'null' value when there is only 1 currency or its default
    const showResetFilter = Object.entries(filter).some(([key, value]) =>
      key !== 'currencyId' ? (value ? true : false) : false,
    )

    return (
      <SimpleGrid columns={2} spacingX={3}>
        <Button
          variant="outline"
          colorScheme="gray"
          type="submit"
          disabled={isSubmitting}
        >
          <Text as="span" isTruncated>
            {t('explore.nfts.form.submit')}
          </Text>
        </Button>
        {showResetFilter && (
          <Button
            variant="ghost"
            colorScheme="gray"
            onClick={clearFilters}
            disabled={isSubmitting}
          >
            <Text as="span" isTruncated>
              {t('explore.nfts.form.clear')}
            </Text>
          </Button>
        )}
      </SimpleGrid>
    )
  }, [clearFilters, filter, isSubmitting, t])

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url === '/explore') {
        reset()
      }
    }
    events.on('routeChangeStart', handleRouteChange)
    return () => {
      events.off('routeChangeStart', handleRouteChange)
    }
  }, [events, reset])

  const ChakraPagination = chakra(Pagination)

  return (
    <ExploreTemplate
      title={t('explore.title')}
      loading={isSubmitting || pageLoading || loadingOrder}
      search={search}
      selectedTabIndex={0}
    >
      <Grid
        mt={6}
        gap={{ base: 4, lg: 3, xl: 4 }}
        templateColumns={{ lg: 'repeat(5, 1fr)', xl: 'repeat(4, 1fr)' }}
      >
        <GridItem as="aside">
          <Stack spacing={8} as="form" onSubmit={onSubmit}>
            {filterButtons}

            <hr />

            <Stack spacing={3}>
              <Select
                label={t('explore.nfts.form.currency.label')}
                name="currencyId"
                control={control as any} // TODO: fix this type
                placeholder={t('explore.nfts.form.currency.placeholder')}
                choices={currencies.map((x) => ({
                  value: x.id,
                  label: x.symbol || '',
                  image: x.image,
                }))}
                value={currencyId ? currencyId : undefined}
                required
                disabled={currencies.length <= 1 || isSubmitting}
                error={errors.currencyId}
                onChange={(x: any) => setValue('currencyId', x)}
              />

              {currency && (
                <Flex gap={3}>
                  <InputGroup>
                    <NumberInput
                      clampValueOnBlur={false}
                      min={0}
                      step={Math.pow(10, -currency.decimals)}
                      precision={currency.decimals}
                      allowMouseWheel
                      w="full"
                      isDisabled={isSubmitting}
                      onChange={(x: any) => setValue('minPrice', x)}
                      format={(e) => e.toString()}
                    >
                      <NumberInputField
                        placeholder={t(
                          'explore.nfts.form.min-price.placeholder',
                        )}
                        {...register('minPrice')}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </InputGroup>

                  <InputGroup>
                    <NumberInput
                      clampValueOnBlur={false}
                      min={0}
                      step={Math.pow(10, -currency.decimals)}
                      precision={currency.decimals}
                      allowMouseWheel
                      w="full"
                      isDisabled={isSubmitting}
                      onChange={(x: any) => setValue('maxPrice', x)}
                      format={(e) => e.toString()}
                    >
                      <NumberInputField
                        placeholder={t(
                          'explore.nfts.form.max-price.placeholder',
                        )}
                        {...register('maxPrice')}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </InputGroup>
                </Flex>
              )}
            </Stack>

            <hr />

            <FormControl>
              <FormLabel>{t('explore.nfts.form.offers.label')}</FormLabel>
              <VStack>
                {[
                  {
                    label: t('explore.nfts.form.offers.values.fixed'),
                    value: OfferFilter.fixed,
                  },
                  {
                    label: t('explore.nfts.form.offers.values.auction'),
                    value: OfferFilter.auction,
                  },
                ].map((x) => (
                  <Checkbox
                    key={x.value}
                    {...register('offers')}
                    value={x.value}
                    disabled={isSubmitting}
                  >
                    {x.label}
                  </Checkbox>
                ))}
              </VStack>
            </FormControl>

            <hr />

            <FormControl>
              <FormLabel>{t('explore.nfts.form.collections.label')}</FormLabel>
              <VStack>
                {collections.map((x) => (
                  <Checkbox
                    key={`${x.chainId}-${x.address}`}
                    {...register('collections')}
                    value={`${x.chainId}-${x.address}`}
                    disabled={isSubmitting}
                  >
                    {x.name}
                  </Checkbox>
                ))}
              </VStack>
            </FormControl>

            <hr />

            <FormControl>
              <FormLabel>{t('explore.nfts.form.categories.label')}</FormLabel>
              <VStack>
                {categories.map((x) => (
                  <Checkbox
                    key={x}
                    {...register('categories')}
                    value={x}
                    disabled={isSubmitting}
                  >
                    {t(`categories.${x}`, null, { fallback: x })}
                  </Checkbox>
                ))}
              </VStack>
            </FormControl>

            <hr />

            {filterButtons}
          </Stack>
        </GridItem>
        <GridItem gap={6} pt={{ base: 8, lg: 0 }} colSpan={{ lg: 4, xl: 3 }}>
          <Box ml="auto" w={{ base: 'full', lg: 'min-content' }}>
            <Select<AssetsOrderBy>
              label={t('explore.nfts.orderBy.label')}
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
          {assets.length > 0 ? (
            <SimpleGrid
              flexWrap="wrap"
              spacing={{ base: 4, lg: 3, xl: 4 }}
              columns={{ base: 1, sm: 2, md: 3 }}
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
                title={t('explore.nfts.empty.title')}
                description={t('explore.nfts.empty.description')}
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
    </ExploreTemplate>
  )
}

export default ExplorePage
