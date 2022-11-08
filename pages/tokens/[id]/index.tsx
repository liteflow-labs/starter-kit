import { AssetDetail } from '@nft/templates'
import { connectors } from 'connectors'
import useEagerConnect from 'hooks/useEagerConnect'
import { NextPage } from 'next'
import Head from '../../../components/Head'
import environment from '../../../environment'
import LargeLayout from '../../../layouts/large'

export const getServerSideProps = AssetDetail.server(environment.GRAPHQL_URL)

const DetailPage: NextPage<AssetDetail.Props> = ({
  currentAccount,
  assetId,
  now,
  meta,
}) => {
  const reconnected = useEagerConnect(connectors, currentAccount)

  return (
    <LargeLayout>
      <Head
        title={meta.title}
        description={meta.description}
        image={meta.image}
      />
      <AssetDetail.Template
        currentAccount={currentAccount}
        assetId={assetId}
        now={now}
        explorer={{
          name: environment.BLOCKCHAIN_EXPLORER_NAME,
          url: environment.BLOCKCHAIN_EXPLORER_URL,
        }}
        reportEmail={environment.REPORT_EMAIL}
        userHasBeenReconnected={reconnected}
      />
    </LargeLayout>
  )
}

export default DetailPage
