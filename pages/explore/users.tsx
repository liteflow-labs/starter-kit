import { chakra, Flex, SimpleGrid, Text } from '@chakra-ui/react'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useMemo } from 'react'
import Empty from '../../components/Empty/Empty'
import ExploreTemplate from '../../components/Explore'
import Head from '../../components/Head'
import Pagination from '../../components/Pagination/Pagination'
import UserCard from '../../components/User/UserCard'
import { convertUserWithCover } from '../../convert'
import environment from '../../environment'
import {
  AccountFilter,
  FetchExploreUsersDocument,
  FetchExploreUsersQuery,
  useFetchExploreUsersQuery,
} from '../../graphql'
import useEagerConnect from '../../hooks/useEagerConnect'
import usePaginate from '../../hooks/usePaginate'
import usePaginateQuery from '../../hooks/usePaginateQuery'
import useQueryParamSingle from '../../hooks/useQueryParamSingle'
import { wrapServerSideProps } from '../../props'

type Props = {}

const searchFilter = (search: string): AccountFilter =>
  ({
    or: [
      { name: { includesInsensitive: search } } as AccountFilter,
      { address: { includesInsensitive: search } } as AccountFilter,
      { description: { includesInsensitive: search } } as AccountFilter,
    ],
  } as AccountFilter)

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

    const { data, error } = await client.query<FetchExploreUsersQuery>({
      query: FetchExploreUsersDocument,
      variables: { limit, offset, filter: queryFilter },
    })
    if (error) throw error
    if (!data) throw new Error('data is falsy')

    return {
      props: {},
    }
  },
)

const UsersPage: NextPage<Props> = () => {
  useEagerConnect()
  const { t } = useTranslation('templates')
  const { limit, offset, page } = usePaginateQuery()
  const search = useQueryParamSingle('search')
  const { data } = useFetchExploreUsersQuery({
    variables: {
      limit,
      offset,
      filter: search ? searchFilter(search) : [],
    },
  })

  const [changePage, changeLimit, { loading: pageLoading }] = usePaginate()

  const users = useMemo(() => data?.users?.nodes || [], [data])

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
          {users.length > 0 ? (
            <SimpleGrid
              flexWrap="wrap"
              spacing={4}
              columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
              py={6}
            >
              {users.map((user, i) => (
                <UserCard
                  key={i}
                  user={convertUserWithCover(user, user.address)}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Flex align="center" justify="center" h="full" py={12}>
              <Empty
                title={t('explore.users.empty.title')}
                description={t('explore.users.empty.description')}
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
            total={data?.users?.totalCount}
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

export default UsersPage
