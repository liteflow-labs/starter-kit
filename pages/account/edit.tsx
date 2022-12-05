import { useToast } from '@chakra-ui/react'
import { Account, UserFormEdit } from '@nft/components'
import { useWeb3React } from '@web3-react/core'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import Head from '../../components/Head'
import environment from '../../environment'
import { useGetAccountQuery } from '../../graphql'
import useEagerConnect from '../../hooks/useEagerConnect'
import useLoginRedirect from '../../hooks/useLoginRedirect'
import useSigner from '../../hooks/useSigner'
import SmallLayout from '../../layouts/small'

const EditPage: NextPage = () => {
  const ready = useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { push } = useRouter()
  const { account } = useWeb3React()
  useLoginRedirect(ready)

  const toast = useToast()

  const { data } = useGetAccountQuery({
    variables: {
      address: account?.toLowerCase() || '',
    },
    skip: !account,
  })

  const onSubmit = useCallback(
    async (address: string) => {
      toast({
        title: t('users.form.notifications.updated'),
        status: 'success',
      })
      await push(`/users/${address}`)
    },
    [toast, t, push],
  )

  if (!data?.account) return <></>
  return (
    <SmallLayout>
      <Head title="Account - Edit profile" />

      <Account currentTab="edit-profile">
        <UserFormEdit
          signer={signer}
          onUpdated={onSubmit}
          uploadUrl={environment.UPLOAD_URL}
          account={data.account}
        />
      </Account>
    </SmallLayout>
  )
}

export default EditPage
