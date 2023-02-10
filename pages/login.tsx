import { Box, Flex, Heading, Text, useToast } from '@chakra-ui/react'
import { useInvitation } from '@nft/hooks'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { useWeb3React } from '@web3-react/core'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import Head from '../components/Head'
import LoginForm from '../components/Login/Form'
import BackButton from '../components/Navbar/BackButton'
import environment from '../environment'
import useEagerConnect from '../hooks/useEagerConnect'
import useSigner from '../hooks/useSigner'
import SmallLayout from '../layouts/small'

const LoginPage: NextPage = () => {
  useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { back, query, replace } = useRouter()
  const referral = Array.isArray(query.ref) ? query.ref[0] : query.ref
  const { account, activate } = useWeb3React()
  const { accept } = useInvitation(signer)
  const toast = useToast()

  const handleAuthenticated = useCallback(
    async (
      connector: AbstractConnector,
      onError?: (error: Error) => void,
      throwErrors?: boolean,
    ) => {
      try {
        await activate(connector, onError, throwErrors)
        if (!referral) return
        await accept(referral)
        toast({
          title: t('login.successes.invitation'),
          status: 'success',
        })
      } catch (error) {
        console.warn(error)
        toast({
          title: t('login.errors.invitation'),
          status: 'warning',
        })
      }
    },
    [accept, referral, t, toast, activate],
  )

  const redirect = useCallback(() => {
    if (query.redirectTo && !Array.isArray(query.redirectTo))
      return void replace(query.redirectTo)
    void replace('/')
  }, [query, replace])

  // redirect user if account is found
  useEffect(() => {
    if (!account) return
    redirect()
  }, [account, redirect])

  return (
    <SmallLayout>
      <Head title="Login" />
      <Box as={BackButton} mt={10} onClick={back} />
      <Heading as="h1" variant="title" color="brand.black" mt={12}>
        {t('login.title')}
      </Heading>
      <Heading
        as="h2"
        variant="subtitle"
        fontWeight={500}
        color="gray.500"
        mt={3}
      >
        {t('login.subtitle')}
      </Heading>
      <Text as="p" variant="text" color="gray.500" mt={3}>
        {t('login.description')}
      </Text>
      <Flex
        direction="column"
        mt={12}
        mb={{ base: 12, lg: 24 }}
        justify="center"
      >
        <LoginForm
          activate={handleAuthenticated}
          networkName={environment.NETWORK_NAME}
        />
      </Flex>
    </SmallLayout>
  )
}

export default LoginPage
