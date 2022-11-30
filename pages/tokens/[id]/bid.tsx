import { useSigner } from '@nft/hooks'
import { Bid } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../../components/Head'
import connectors from '../../../connectors'
import environment from '../../../environment'
import useEagerConnect from '../../../hooks/useEagerConnect'
import SmallLayout from '../../../layouts/small'

export const getServerSideProps = Bid.server(environment.GRAPHQL_URL)

const BidPage: NextPage<Bid.Props> = ({ now, assetId, meta }) => {
  const ready = useEagerConnect()
  const signer = useSigner()
  return (
    <SmallLayout>
      <Head
        title={meta.title}
        description={meta.description}
        image={meta.image}
      />
      <Bid.Template
        assetId={assetId}
        explorer={{
          name: environment.BLOCKCHAIN_EXPLORER_NAME,
          url: environment.BLOCKCHAIN_EXPLORER_URL,
        }}
        now={now}
        allowTopUp={true}
        auctionValidity={environment.AUCTION_VALIDITY_IN_SECONDS}
        offerValidity={environment.OFFER_VALIDITY_IN_SECONDS}
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

export default BidPage
