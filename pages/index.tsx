import { Button, Heading } from '@chakra-ui/react'
import { Link } from '@nft/components'
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
  currentAccount,
  featuredTokens,
  limit,
  now,
  tokens,
}) => {
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
      />
      <section className="mt-12 flex flex-col items-center justify-center p-16">
        <Heading as="h1" variant="title" color="brand.black">
          Got an NFT project in mind?
        </Heading>
        <Heading
          as="h2"
          variant="title"
          fontWeight={500}
          color="gray.500"
          mt={2}
        >
          Schedule a demo with us
        </Heading>

        <Button
          as={Link}
          href="https://calendly.com/anthony-estebe/liteflow-nft-marketplace"
          isExternal
          mt={12}
          size="lg"
        >
          Schedule a Demo
        </Button>
      </section>
    </LargeLayout>
  )
}

export default HomePage
