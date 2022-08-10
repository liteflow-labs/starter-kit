import { DesignSystem, Theme } from '@nft/components'
import { Home } from '@nft/templates'
import { NextPage } from 'next'
import environment from '../environment'
import LargeLayout from '../layouts/large'

export const getServerSideProps = Home.server(
  environment.GRAPHQL_URL,
  environment.FEATURED_TOKEN,
  environment.PAGINATION_LIMIT,
  environment.HOME_TOKENS,
)

const HomePage: NextPage<Home.Props> = ({
  featuredTokens,
  limit,
  now,
  tokens,
}) => {
  return (
    <LargeLayout>
      <Home.Template
        featuredTokens={featuredTokens}
        limit={limit}
        now={now}
        tokens={tokens}
        explorer={{
          name: environment.BLOCKCHAIN_EXPLORER_NAME,
          url: environment.BLOCKCHAIN_EXPLORER_URL,
        }}
      />
      <section className="mt-12 flex flex-col items-center justify-center p-16">
        <Theme.Title>Got an NFT project in mind?</Theme.Title>
        <Theme.Subtitle className="mt-2">
          <span className="text-4xl font-medium leading-10 text-gray-500">
            Schedule a demo with us
          </span>
        </Theme.Subtitle>
        <DesignSystem.Button.Primary
          large
          className="mt-12"
          href="https://calendly.com/anthony-estebe/liteflow-nft-marketplace"
          target="_blank"
          rel="noreferrer"
        >
          Schedule a Demo
        </DesignSystem.Button.Primary>
      </section>
    </LargeLayout>
  )
}

export default HomePage
