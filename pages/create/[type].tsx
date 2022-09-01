import { AssetForm } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../components/Head'
import environment from '../../environment'
import SmallLayout from '../../layouts/small'

export const getServerSideProps = AssetForm.server(environment.GRAPHQL_URL)

const CreatePage: NextPage<AssetForm.Props> = ({ multiple }) => (
  <SmallLayout>
    <Head
      title="Create Collectible"
      description="Create Collectible securely stored on blockchain"
    />
    <AssetForm.Template
      multiple={multiple}
      explorer={{
        name: environment.BLOCKCHAIN_EXPLORER_NAME,
        url: environment.BLOCKCHAIN_EXPLORER_URL,
      }}
      uploadUrl={environment.UPLOAD_URL}
      login={{
        email: true,
        metamask: true,
        walletConnect: true,
        coinbase: true,
        networkName: environment.NETWORK_NAME,
      }}
      activateUnlockableContent={false}
    />
  </SmallLayout>
)

export default CreatePage
