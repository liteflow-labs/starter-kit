import { Explorer } from '@nft/templates'
import { connectors } from 'connectors'
import useEagerConnect from 'hooks/useEagerConnect'
import { NextPage } from 'next'
import Head from '../components/Head'
import environment from '../environment'
import LargeLayout from '../layouts/large'
import { values } from '../traits'

export const getServerSideProps = Explorer.server(
  environment.GRAPHQL_URL,
  values,
  environment.PAGINATION_LIMIT,
)

const ExplorePage: NextPage<Explorer.Props> = ({
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
  const reconnected = useEagerConnect(connectors)

  return (
    <LargeLayout>
      <Head title="Explore Collectibles" />
      <Explorer.Template
        filter={filter}
        traits={traits}
        limit={limit}
        limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
        now={now}
        offset={offset}
        orderBy={orderBy}
        page={page}
        queryFilter={queryFilter}
        search={search}
        userHasBeenReconnected={reconnected}
      />
    </LargeLayout>
  )
}

export default ExplorePage
