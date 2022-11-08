import { UserForm } from '@nft/templates'
import { connectors } from 'connectors'
import useEagerConnect from 'hooks/useEagerConnect'
import { NextPage } from 'next'
import Head from '../../components/Head'
import environment from '../../environment'
import SmallLayout from '../../layouts/small'

const EditPage: NextPage = () => {
  const reconnected = useEagerConnect(connectors)

  return (
    <SmallLayout>
      <Head title="Account - Edit profile" />
      <UserForm.Template
        userHasBeenReconnected={reconnected}
        uploadUrl={environment.UPLOAD_URL}
      />
    </SmallLayout>
  )
}

export default EditPage
