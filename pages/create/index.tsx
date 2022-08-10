import { TypeSelector } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../components/Head'
import SmallLayout from '../../layouts/small'

const CreatePage: NextPage = () => (
  <SmallLayout>
    <Head
      title="Create an NFT"
      description="Create your NFT securely stored on blockchain"
    />
    <TypeSelector.Template />
  </SmallLayout>
)

export default CreatePage
