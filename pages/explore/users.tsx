import {
  chakra,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Tab,
  TabList,
  Tabs,
  Text,
} from '@chakra-ui/react'
import Link from 'components/Link/Link'
import UserCard from 'components/User/UserCard'
import { convertUserCard } from 'convert'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useMemo } from 'react'
import Empty from '../../components/Empty/Empty'
import Head from '../../components/Head'
import Pagination from '../../components/Pagination/Pagination'
import environment from '../../environment'
import {
  FetchExploreUsersDocument,
  FetchExploreUsersQuery,
  useFetchExploreUsersQuery,
} from '../../graphql'
import useEagerConnect from '../../hooks/useEagerConnect'
import useExecuteOnAccountChange from '../../hooks/useExecuteOnAccountChange'
import usePaginate from '../../hooks/usePaginate'
import LargeLayout from '../../layouts/large'
import { wrapServerSideProps } from '../../props'

type Props = {
  limit: number
  page: number
  offset: number
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

    const { data, error } = await client.query<FetchExploreUsersQuery>({
      query: FetchExploreUsersDocument,
      variables: { limit, offset },
    })
    if (error) throw error
    if (!data) throw new Error('data is falsy')

    return {
      props: {
        limit,
        page,
        offset,
      },
    }
  },
)

const UsersPage: NextPage<Props> = ({ offset, limit, page }) => {
  const ready = useEagerConnect()
  const { t } = useTranslation('templates')
  const { data, refetch } = useFetchExploreUsersQuery({
    variables: {
      limit,
      offset,
    },
  })
  useExecuteOnAccountChange(refetch, ready)

  const [changePage, changeLimit, { loading: pageLoading }] = usePaginate()

  const users = useMemo(() => data?.users?.nodes || [], [data])

  const ChakraPagination = chakra(Pagination)

  return (
    <LargeLayout>
      <Head title="Explore Users" />

      <Flex justify="space-between" mb={{ base: 4, lg: 0 }} align="center">
        <Heading as="h1" variant="title" color="brand.black">
          {t('explore.title')}
        </Heading>

        {pageLoading && <Spinner thickness="2px" speed="0.65s" />}
      </Flex>

      <Tabs
        defaultIndex={1} // Users
        colorScheme="brand"
        pt={10}
        pb={{ base: 2.5, md: 0 }}
        overflowX="auto"
      >
        <TabList>
          <Link href="/explore" whiteSpace="nowrap" mr={4}>
            <Tab as="div" borderColor="gray.200" pb={4} color="gray.500">
              <Text as="span" variant="subtitle1">
                NFTs
              </Text>
            </Tab>
          </Link>
          <Link href="/explore/users" whiteSpace="nowrap">
            <Tab as="div" borderColor="gray.200" pb={4} color="gray.500">
              <Text as="span" variant="subtitle1">
                Users
              </Text>
            </Tab>
          </Link>
        </TabList>
      </Tabs>

      {users.length > 0 ? (
        <SimpleGrid
          flexWrap="wrap"
          spacing={4}
          columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
          py={6}
        >
          {users.map((user, i) => (
            <UserCard key={i} user={convertUserCard(user, user.address)} />
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
              components={[<Text as="span" color="brand.black" key="text" />]}
            />
          ),
          pages: (props) =>
            t('pagination.result.pages', { count: props.total }),
        }}
      />
    </LargeLayout>
  )
}

export default UsersPage
