import { TypeSelector } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../components/Head'
import environment from '../../environment'
import SmallLayout from '../../layouts/small'

export const getServerSideProps = TypeSelector.server(environment.GRAPHQL_URL)

const CreatePage: NextPage<TypeSelector.Props> = ({ currentAccount }) => (
  <SmallLayout>
    <Head
      title="Create an NFT"
      description="Create your NFT securely stored on blockchain"
    />
    <TypeSelector.Template
      restrictMintToVerifiedAccount={true}
      reportEmail={environment.REPORT_EMAIL}
      currentAccount={currentAccount}
    />
  </SmallLayout>
)

export default CreatePage
