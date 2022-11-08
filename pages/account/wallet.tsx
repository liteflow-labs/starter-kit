import { UserWallet } from '@nft/templates'
import { connectors } from 'connectors'
import useEagerConnect from 'hooks/useEagerConnect'
import { NextPage } from 'next'
import Head from '../../components/Head'
import environment from '../../environment'
import SmallLayout from '../../layouts/small'

export const getServerSideProps = UserWallet.server(environment.GRAPHQL_URL)

const WalletPage: NextPage<UserWallet.Props> = () => {
  const reconnected = useEagerConnect(connectors)

  return (
    <SmallLayout>
      <Head title="Account - Wallet" />
      <UserWallet.Template
        userHasBeenReconnected={reconnected}
        networkName={environment.NETWORK_NAME}
      />
    </SmallLayout>
  )
}

export default WalletPage
