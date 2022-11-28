import { TypeSelector } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../components/Head'
import environment from '../../environment'
import useEagerConnect from '../../hooks/useEagerConnect'
import SmallLayout from '../../layouts/small'

export const getServerSideProps = TypeSelector.server(environment.GRAPHQL_URL)

const CreatePage: NextPage<TypeSelector.Props> = ({ currentAccount }) => {
  const ready = useEagerConnect()
  return (
    <SmallLayout>
      <Head
        title="Create an NFT"
        description="Create your NFT securely stored on blockchain"
      />
      <TypeSelector.Template
        restrictMintToVerifiedAccount={true}
        reportEmail={environment.REPORT_EMAIL}
        currentAccount={currentAccount}
        ready={ready}
      />
    </SmallLayout>
  )
}

export default CreatePage
