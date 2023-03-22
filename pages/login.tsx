import { Box, Flex, Heading, useToast } from '@chakra-ui/react'
import { useInvitation } from '@nft/hooks'
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import Head from '../components/Head'
import BackButton from '../components/Navbar/BackButton'
import useAccount from '../hooks/useAccount'
import useEagerConnect from '../hooks/useEagerConnect'
import useSigner from '../hooks/useSigner'
import SmallLayout from '../layouts/small'

const LoginPage: NextPage = () => {
  useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { back, query, replace } = useRouter()
  const referral = Array.isArray(query.ref) ? query.ref[0] : query.ref
  const { isLoggedIn } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { accept } = useInvitation(signer)
  const toast = useToast()

  const acceptInvitation = useCallback(async () => {
    try {
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
  }, [accept, referral, t, toast])

  const redirect = useCallback(() => {
    if (query.redirectTo && !Array.isArray(query.redirectTo))
      return void replace(query.redirectTo)
    void replace('/')
  }, [query, replace])

  // redirect user if account is found
  useEffect(() => {
    if (!isLoggedIn) return
    acceptInvitation().finally(redirect)
  }, [isLoggedIn, redirect, acceptInvitation])

  useEffect(() => openConnectModal && openConnectModal(), [openConnectModal])

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
      <Flex
        direction="column"
        mt={12}
        mb={{ base: 12, lg: 24 }}
        justify="center"
      >
        <ConnectButton
          accountStatus="address"
          chainStatus="none"
          showBalance={false}
        />
      </Flex>
    </SmallLayout>
  )
}

export default LoginPage
