import { Box, Flex, SimpleGrid, Text, useToast } from '@chakra-ui/react'
import { formatError } from '@nft/hooks'
import CollectionCard from 'components/Collection/CollectionCard'
import ExploreTemplate from 'components/Explore'
import Head from 'components/Head'
import { convertCollection } from 'convert'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import Empty from '../../components/Empty/Empty'
import Pagination from '../../components/Pagination/Pagination'
import Select from '../../components/Select/Select'
import environment from '../../environment'
import {
  CollectionFilter,
  CollectionsOrderBy,
  useFetchExploreCollectionsQuery,
} from '../../graphql'
import useEagerConnect from '../../hooks/useEagerConnect'
import useOrderByQuery from '../../hooks/useOrderByQuery'
import usePaginate from '../../hooks/usePaginate'
import usePaginateQuery from '../../hooks/usePaginateQuery'
import useQueryParamSingle from '../../hooks/useQueryParamSingle'

type Props = {}

const searchFilter = (search: string): CollectionFilter =>
  ({
    or: [
      { name: { includesInsensitive: search } } as CollectionFilter,
      { address: { includesInsensitive: search } } as CollectionFilter,
      { description: { includesInsensitive: search } } as CollectionFilter,
    ],
  } as CollectionFilter)

const CollectionsPage: NextPage<Props> = ({}) => {
  useEagerConnect()
  const { pathname, query, replace } = useRouter()
  const { t } = useTranslation('templates')
  const toast = useToast()
  const [loadingOrder, setLoadingOrder] = useState(false)
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<CollectionsOrderBy>('TOTAL_VOLUME_DESC')
  const search = useQueryParamSingle('search')
  const { data } = useFetchExploreCollectionsQuery({
    variables: {
      limit,
      offset,
      orderBy,
      filter: search ? searchFilter(search) : [],
    },
  })

  const [changePage, changeLimit, { loading: pageLoading }] = usePaginate()

  const changeOrder = useCallback(
    async (orderBy: any) => {
      setLoadingOrder(true)
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
      } finally {
        setLoadingOrder(false)
      }
    },
    [replace, pathname, query, toast],
  )

  const collections = useMemo(() => data?.collections?.nodes || [], [data])

  return (
    <>
      <Head title={t('explore.title')} />

      <ExploreTemplate
        title={t('explore.title')}
        loading={pageLoading || loadingOrder}
        search={search}
        selectedTabIndex={1}
      >
        <>
          <Box ml="auto" w={{ base: 'full', lg: 'min-content' }} pt={4}>
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
          {collections.length > 0 ? (
            <SimpleGrid
              flexWrap="wrap"
              spacing={4}
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              py={6}
            >
              {collections.map((collection, i) => (
                <CollectionCard
                  collection={convertCollection(collection)}
                  key={i}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Flex align="center" justify="center" h="full" py={12}>
              <Empty
                title={t('explore.collections.empty.title')}
                description={t('explore.collections.empty.description')}
              />
            </Flex>
          )}
          <Box py="6" borderTop="1px" borderColor="gray.200">
            <Pagination
              limit={limit}
              limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
              page={page}
              total={data?.collections?.totalCount}
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
        </>
      </ExploreTemplate>
    </>
  )
}

export default CollectionsPage
