import { Box, Flex, Heading, Stack, Text, useToast } from '@chakra-ui/react'
import { useInvitation } from '@nft/hooks'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import WalletEmail from 'components/Wallet/Connectors/Email'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Head from '../components/Head'
import BackButton from '../components/Navbar/BackButton'
import WalletCoinbase from '../components/Wallet/Connectors/Coinbase'
import WalletMetamask from '../components/Wallet/Connectors/Metamask'
import WalletWalletConnect from '../components/Wallet/Connectors/WalletConnect'
import connectors from '../connectors'
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
  const { account, error, activate } = useWeb3React()
  const { accept } = useInvitation(signer)
  const toast = useToast()
  const [errorFromLogin, setErrorFromLogin] = useState<Error>()

  const invalidNetwork = useMemo(
    () => errorFromLogin && errorFromLogin instanceof UnsupportedChainIdError,
    [errorFromLogin],
  )

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

  const hasStandardWallet =
    connectors.injected || connectors.coinbase || connectors.walletConnect
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
        {connectors.email && (
          <WalletEmail
            connector={connectors.email}
            activate={handleAuthenticated}
          />
        )}

        {connectors.email && hasStandardWallet && (
          <Flex mt={12} position="relative">
            <Flex
              position="absolute"
              align="center"
              top={0}
              left={0}
              bottom={0}
              right={0}
            >
              <Box w="full" borderTop="1px" borderColor="gray.200" />
            </Flex>
            <Box as="span" position="relative" bgColor="white" pr={2}>
              <Text as="p" variant="text-sm" fontWeight={500} color="gray.500">
                {t('login.alternative')}
              </Text>
            </Box>
          </Flex>
        )}

        {error && (
          <Text as="span" role="alert" variant="error" mt={3}>
            {error.message ? error.message : error.toString()}
          </Text>
        )}
        {invalidNetwork && (
          <Text as="span" role="alert" variant="error" mt={3}>
            {t('login.errors.wrong-network', {
              networkName: environment.NETWORK_NAME,
            })}
          </Text>
        )}
        {hasStandardWallet && (
          <Flex
            as="nav"
            direction={{ base: 'column', md: 'row' }}
            mt={6}
            gap={6}
          >
            {connectors.injected && (
              <Stack
                cursor="pointer"
                w="full"
                spacing={3}
                rounded="xl"
                borderWidth={1}
                borderColor="gray.200"
                shadow="sm"
                _hover={{
                  shadow: 'md',
                }}
                transition="box-shadow 0.3s ease-in-out"
              >
                <WalletMetamask
                  connector={connectors.injected}
                  onError={setErrorFromLogin}
                  activate={handleAuthenticated}
                />
              </Stack>
            )}
            {connectors.coinbase && (
              <Stack
                cursor="pointer"
                w="full"
                spacing={3}
                rounded="xl"
                borderWidth={1}
                borderColor="gray.200"
                shadow="sm"
                _hover={{
                  shadow: 'md',
                }}
                transition="box-shadow 0.3s ease-in-out"
              >
                <WalletCoinbase
                  connector={connectors.coinbase}
                  onError={setErrorFromLogin}
                  activate={handleAuthenticated}
                />
              </Stack>
            )}
            {connectors.walletConnect && (
              <Stack
                cursor="pointer"
                w="full"
                spacing={3}
                rounded="xl"
                borderWidth={1}
                borderColor="gray.200"
                shadow="sm"
                _hover={{
                  shadow: 'md',
                }}
                transition="box-shadow 0.3s ease-in-out"
              >
                <WalletWalletConnect
                  connector={connectors.walletConnect}
                  onError={setErrorFromLogin}
                  activate={activate}
                />
              </Stack>
            )}
          </Flex>
        )}
      </Flex>
    </SmallLayout>
  )
}

export default LoginPage
