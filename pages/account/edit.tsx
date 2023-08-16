import { Box, useToast } from '@chakra-ui/react'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import AccountTemplate from '../../components/Account/Account'
import Head from '../../components/Head'
import Loader from '../../components/Loader'
import UserFormEdit from '../../components/User/Form/Edit'
import { useGetAccountQuery } from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useLoginRedirect from '../../hooks/useLoginRedirect'
import useSigner from '../../hooks/useSigner'
import SmallLayout from '../../layouts/small'

const EditPage: NextPage = () => {
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { push } = useRouter()
  const { address, isLoggedIn } = useAccount()
  useLoginRedirect()

  const toast = useToast()

  const { data } = useGetAccountQuery({
    variables: {
      address: address || '',
    },
    skip: !isLoggedIn,
  })
  const account = data?.account

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

  if (account === null) return <Error statusCode={404} />
  return (
    <SmallLayout>
      <Head title="Account - Edit profile" />

      <AccountTemplate currentTab="edit-profile">
        {!account ? (
          <Box mt={4}>
            <Loader />
          </Box>
        ) : (
          <UserFormEdit
            signer={signer}
            onUpdated={onSubmit}
            account={account}
          />
        )}
      </AccountTemplate>
    </SmallLayout>
  )
}

export default EditPage
