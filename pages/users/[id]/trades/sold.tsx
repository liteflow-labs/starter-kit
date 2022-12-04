import { UserTradeSold } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../../../components/Head'
import environment from '../../../../environment'
import useEagerConnect from '../../../../hooks/useEagerConnect'
import useSigner from '../../../../hooks/useSigner'
import LargeLayout from '../../../../layouts/large'

export const getServerSideProps = UserTradeSold.server(
  environment.GRAPHQL_URL,
  environment.PAGINATION_LIMIT,
)

const TradeSoldPage: NextPage<UserTradeSold.Props> = ({
  meta,
  now,
  limit,
  page,
  offset,
  orderBy,
  userAddress,
}) => {
  useEagerConnect()
  const signer = useSigner()
  return (
    <LargeLayout>
      <Head
        title={meta.title}
        description={meta.description}
        image={meta.image}
      />

      <UserTradeSold.Template
        explorer={{
          name: environment.BLOCKCHAIN_EXPLORER_NAME,
          url: environment.BLOCKCHAIN_EXPLORER_URL,
        }}
        limit={limit}
        now={now}
        limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
        offset={offset}
        orderBy={orderBy}
        page={page}
        userAddress={userAddress}
        loginUrlForReferral={environment.BASE_URL + '/login'}
        signer={signer}
      />
    </LargeLayout>
  )
}

export default TradeSoldPage
