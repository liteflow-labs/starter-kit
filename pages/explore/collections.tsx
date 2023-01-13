import { chakra, Flex, SimpleGrid, Text } from '@chakra-ui/react'
import CollectionCard from 'components/Collection/CollectionCard'
import ExploreTemplate from 'components/Explore'
import Head from 'components/Head'
import { convertCollection } from 'convert'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useMemo } from 'react'
import Empty from '../../components/Empty/Empty'
import Pagination from '../../components/Pagination/Pagination'
import environment from '../../environment'
import {
  CollectionFilter,
  FetchExploreCollectionsDocument,
  FetchExploreCollectionsQuery,
  useFetchExploreCollectionsQuery,
} from '../../graphql'
import useEagerConnect from '../../hooks/useEagerConnect'
import usePaginate from '../../hooks/usePaginate'
import { wrapServerSideProps } from '../../props'

type Props = {
  limit: number
  page: number
  offset: number
  queryFilter: CollectionFilter[]
  search: string | null
}
const searchFilter = (search: string): CollectionFilter =>
  ({
    or: [
      { name: { includesInsensitive: search } } as CollectionFilter,
      { address: { includesInsensitive: search } } as CollectionFilter,
      { description: { includesInsensitive: search } } as CollectionFilter,
    ],
  } as CollectionFilter)

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
    const search =
      ctx.query.search && !Array.isArray(ctx.query.search)
        ? ctx.query.search
        : null

    const queryFilter = []
    if (search) queryFilter.push(searchFilter(search))

    const { data, error } = await client.query<FetchExploreCollectionsQuery>({
      query: FetchExploreCollectionsDocument,
      variables: { limit, offset, filter: queryFilter },
    })
    if (error) throw error
    if (!data) throw new Error('data is falsy')

    return {
      props: {
        limit,
        page,
        offset,
        queryFilter,
        search,
      },
    }
  },
)

const CollectionsPage: NextPage<Props> = ({
  offset,
  limit,
  page,
  queryFilter,
  search,
}) => {
  useEagerConnect()
  const { t } = useTranslation('templates')
  const { data } = useFetchExploreCollectionsQuery({
    variables: {
      limit,
      offset,
      filter: queryFilter,
    },
  })

  const [changePage, changeLimit, { loading: pageLoading }] = usePaginate()

  const collections = useMemo(() => data?.collections?.nodes || [], [data])

  const ChakraPagination = chakra(Pagination)

  return (
    <>
      <Head title={t('explore.title')} />

      <ExploreTemplate
        title={t('explore.title')}
        loading={pageLoading}
        search={search}
        selectedTabIndex={2}
      >
        <>
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
          <ChakraPagination
            py="6"
            borderTop="1px"
            borderColor="gray.200"
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
        </>
      </ExploreTemplate>
    </>
  )
}

export default CollectionsPage
