import { Home } from '@nft/templates'
import { NextPage } from 'next'
import environment from '../environment'
import useEagerConnect from '../hooks/useEagerConnect'
import LargeLayout from '../layouts/large'

export const getServerSideProps = Home.server(
  environment.GRAPHQL_URL,
  environment.FEATURED_TOKEN,
  environment.PAGINATION_LIMIT,
  environment.HOME_TOKENS,
)

const HomePage: NextPage<Home.Props> = ({
  currentAccount,
  featuredTokens,
  limit,
  now,
  tokens,
}) => {
  const ready = useEagerConnect()
  return (
    <LargeLayout>
      <Home.Template
        currentAccount={currentAccount}
        featuredTokens={featuredTokens}
        limit={limit}
        now={now}
        tokens={tokens}
        explorer={{
          name: environment.BLOCKCHAIN_EXPLORER_NAME,
          url: environment.BLOCKCHAIN_EXPLORER_URL,
        }}
        ready={ready}
      />
    </LargeLayout>
  )
}

export default HomePage
