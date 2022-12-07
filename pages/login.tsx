import { Login } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../components/Head'
import connectors from '../connectors'
import environment from '../environment'
import useEagerConnect from '../hooks/useEagerConnect'
import useSigner from '../hooks/useSigner'
import SmallLayout from '../layouts/small'

const LoginPage: NextPage = () => {
  useEagerConnect()
  const signer = useSigner()
  return (
    <SmallLayout>
      <Head title="Login" />
      <Login.Template
        {...connectors}
        networkName={environment.NETWORK_NAME}
        signer={signer}
      />
    </SmallLayout>
  )
}

export default LoginPage
