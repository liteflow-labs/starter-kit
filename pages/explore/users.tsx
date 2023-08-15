import {
  Box,
  Divider,
  Flex,
  SimpleGrid,
  useBreakpointValue,
} from '@chakra-ui/react'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import Empty from '../../components/Empty/Empty'
import ExploreTemplate from '../../components/Explore'
import Head from '../../components/Head'
import Pagination from '../../components/Pagination/Pagination'
import Select from '../../components/Select/Select'
import SkeletonGrid from '../../components/Skeleton/Grid'
import SkeletonUserCard from '../../components/Skeleton/UserCard'
import UserCard from '../../components/User/UserCard'
import { convertUserWithCover } from '../../convert'
import environment from '../../environment'
import {
  AccountFilter,
  AccountsOrderBy,
  useFetchExploreUsersQuery,
} from '../../graphql'
import useOrderByQuery from '../../hooks/useOrderByQuery'
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
  const { query, pathname, push } = useRouter()
  const isSmall = useBreakpointValue(
    { base: true, md: false },
    { fallback: 'md' },
  )
  const { t } = useTranslation('templates')
  const orderBy = useOrderByQuery<AccountsOrderBy>('CREATED_AT_DESC')
  const { limit, offset, page } = usePaginateQuery()
  const search = useQueryParamSingle('search')
  const { data: usersData } = useFetchExploreUsersQuery({
    variables: {
      limit,
      offset,
      orderBy,
      filter: search ? searchFilter(search) : [],
    },
  })

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

  const users = usersData?.users?.nodes

  const [changePage, changeLimit] = usePaginate()

  return (
    <>
      <Head title={t('explore.title')} />

      <ExploreTemplate
        title={t('explore.title')}
        search={search}
        selectedTabIndex={2}
      >
        <>
          <Flex pt={6} justifyContent="flex-end">
            <Box>
              <Select<AccountsOrderBy>
                label={isSmall ? undefined : t('explore.users.orderBy.label')}
                name="orderBy"
                onChange={changeOrder}
                choices={[
                  {
                    label: t('explore.users.orderBy.values.createdAtDesc'),
                    value: 'CREATED_AT_DESC',
                  },
                  {
                    label: t('explore.users.orderBy.values.createdAtAsc'),
                    value: 'CREATED_AT_ASC',
                  },
                  {
                    label: t('explore.users.orderBy.values.nameAsc'),
                    value: 'NAME_ASC',
                  },
                ]}
                value={orderBy}
                inlineLabel
              />
            </Box>
          </Flex>
          {users === undefined ? (
            <SkeletonGrid
              items={environment.PAGINATION_LIMIT}
              compact
              columns={{ sm: 2, md: 4, lg: 6 }}
              py={6}
            >
              <SkeletonUserCard />
            </SkeletonGrid>
          ) : users.length > 0 ? (
            <SimpleGrid
              flexWrap="wrap"
              spacing={4}
              columns={{ sm: 2, md: 4, lg: 6 }}
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
            <Empty
              title={t('explore.users.empty.title')}
              description={t('explore.users.empty.description')}
            />
          )}
          <Divider my="6" display={users?.length !== 0 ? 'block' : 'none'} />
          {users?.length !== 0 && (
            <Pagination
              limit={limit}
              limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
              page={page}
              onPageChange={changePage}
              onLimitChange={changeLimit}
              hasNextPage={usersData?.users?.pageInfo.hasNextPage}
              hasPreviousPage={usersData?.users?.pageInfo.hasPreviousPage}
            />
          )}
        </>
      </ExploreTemplate>
    </>
  )
}

export default UsersPage
