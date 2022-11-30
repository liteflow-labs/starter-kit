import { useSigner } from '@nft/hooks'
import { Referral } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../components/Head'
import connectors from '../connectors'
import environment from '../environment'
import useEagerConnect from '../hooks/useEagerConnect'
import SmallLayout from '../layouts/small'

const LoginPage: NextPage = () => {
  useEagerConnect()
  const signer = useSigner()
  return (
    <SmallLayout>
      <Head title="Referral" />
      <Referral.Template
        platformName="Demo"
        percentage={{
          base: environment.REFERRAL_PERCENTAGE.base,
          secondary: environment.REFERRAL_PERCENTAGE.secondary,
        }}
        loginUrl={environment.BASE_URL + '/login'}
        login={{
          ...connectors,
          networkName: environment.NETWORK_NAME,
        }}
        signer={signer}
      />
    </SmallLayout>
  )
}

export default LoginPage
