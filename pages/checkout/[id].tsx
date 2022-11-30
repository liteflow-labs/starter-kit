import { useSigner } from '@nft/hooks'
import { Checkout } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../components/Head'
import connectors from '../../connectors'
import environment from '../../environment'
import useEagerConnect from '../../hooks/useEagerConnect'
import SmallLayout from '../../layouts/small'

export const getServerSideProps = Checkout.server(environment.GRAPHQL_URL)

const CheckoutPage: NextPage<Checkout.Props> = ({ now, offerId, meta }) => {
  const ready = useEagerConnect()
  const signer = useSigner()
  return (
    <SmallLayout>
      <Head
        title={meta.title}
        description={meta.description}
        image={meta.image}
      />
      <Checkout.Template
        now={now}
        offerId={offerId}
        explorer={{
          name: environment.BLOCKCHAIN_EXPLORER_NAME,
          url: environment.BLOCKCHAIN_EXPLORER_URL,
        }}
        allowTopUp={true}
        login={{
          ...connectors,
          networkName: environment.NETWORK_NAME,
        }}
        ready={ready}
        signer={signer}
      />
    </SmallLayout>
  )
}

export default CheckoutPage
