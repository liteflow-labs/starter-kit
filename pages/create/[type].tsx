import { useSigner } from '@nft/hooks'
import { AssetForm } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../components/Head'
import connectors from '../../connectors'
import environment from '../../environment'
import useEagerConnect from '../../hooks/useEagerConnect'
import SmallLayout from '../../layouts/small'
import { values } from '../../traits'

export const getServerSideProps = AssetForm.server(
  environment.GRAPHQL_URL,
  values,
)

const CreatePage: NextPage<AssetForm.Props> = ({
  currentAccount,
  traits,
  multiple,
}) => {
  const ready = useEagerConnect()
  const signer = useSigner()
  return (
    <SmallLayout>
      <Head
        title="Create Collectible"
        description="Create Collectible securely stored on blockchain"
      />
      <AssetForm.Template
        currentAccount={currentAccount}
        traits={traits}
        multiple={multiple}
        explorer={{
          name: environment.BLOCKCHAIN_EXPLORER_NAME,
          url: environment.BLOCKCHAIN_EXPLORER_URL,
        }}
        uploadUrl={environment.UPLOAD_URL}
        login={{
          ...connectors,
          networkName: environment.NETWORK_NAME,
        }}
        activateUnlockableContent={true}
        restrictMintToVerifiedAccount={true}
        reportEmail={environment.REPORT_EMAIL}
        ready={ready}
        signer={signer}
      />
    </SmallLayout>
  )
}

export default CreatePage
