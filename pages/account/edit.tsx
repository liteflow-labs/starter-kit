import { useSigner } from '@nft/hooks'
import { UserForm } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../components/Head'
import environment from '../../environment'
import useEagerConnect from '../../hooks/useEagerConnect'
import SmallLayout from '../../layouts/small'

const EditPage: NextPage = () => {
  const ready = useEagerConnect()
  const signer = useSigner()
  return (
    <SmallLayout>
      <Head title="Account - Edit profile" />
      <UserForm.Template
        uploadUrl={environment.UPLOAD_URL}
        ready={ready}
        signer={signer}
      />
    </SmallLayout>
  )
}

export default EditPage
