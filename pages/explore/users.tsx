import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react'
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
import { AccountFilter, useFetchExploreUsersQuery } from '../../graphql'
import useEagerConnect from '../../hooks/useEagerConnect'
import usePaginate from '../../hooks/usePaginate'
import usePaginateQuery from '../../hooks/usePaginateQuery'
import useQueryParamSingle from '../../hooks/useQueryParamSingle'

type Props = {}

const searchFilter = (search: string): AccountFilter =>
  ({
    or: [
      { name: { includesInsensitive: search } } as AccountFilter,
      { address: { includesInsensitive: search } } as AccountFilter,
      { description: { includesInsensitive: search } } as AccountFilter,
    ],
  } as AccountFilter)

const UsersPage: NextPage<Props> = () => {
  useEagerConnect()
  const { t } = useTranslation('templates')
  const { limit, offset, page } = usePaginateQuery()
  const search = useQueryParamSingle('search')
  const { data, loading } = useFetchExploreUsersQuery({
    variables: {
      limit,
      offset,
      filter: search ? searchFilter(search) : [],
    },
  })

  const [changePage, changeLimit, { loading: pageLoading }] = usePaginate()

  const users = useMemo(() => data?.users?.nodes || [], [data])

  return (
    <>
      <Head title={t('explore.title')} />

      <ExploreTemplate
        title={t('explore.title')}
        loading={pageLoading || loading}
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
          <Box py="6" borderTop="1px" borderColor="gray.200">
            <Pagination
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
          </Box>
        </>
      </ExploreTemplate>
    </>
  )
}

export default UsersPage
