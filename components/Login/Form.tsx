import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo, useState } from 'react'
import connectors from '../../connectors'
import WalletCoinbase from '../Wallet/Connectors/Coinbase'
import WalletEmail from '../Wallet/Connectors/Email'
import WalletMetamask from '../Wallet/Connectors/Metamask'
import WalletWalletConnect from '../Wallet/Connectors/WalletConnect'

type Props = {
  activate: (
    connector: AbstractConnector,
    onError?: (error: Error) => void,
    throwErrors?: boolean,
  ) => Promise<void>
  networkName: string
}

const LoginForm: FC<Props> = ({ activate, networkName }) => {
  const { t } = useTranslation('components')

  const { error } = useWeb3React()
  const [errorFromLogin, setErrorFromLogin] = useState<Error>()
  const invalidNetwork = useMemo(
    () => errorFromLogin && errorFromLogin instanceof UnsupportedChainIdError,
    [errorFromLogin],
  )

  const hasStandardWallet =
    connectors.injected || connectors.coinbase || connectors.walletConnect

  return (
    <>
      {connectors.email && <WalletEmail activate={activate} />}
      {connectors.email && hasStandardWallet && (
        <Box position="relative" mt={6} mb={2}>
          <Flex
            position="absolute"
            align="center"
            top={0}
            right={0}
            bottom={0}
            left={0}
          >
            <Box w="full" borderTop="1px" borderColor="gray.200" />
          </Flex>
          <Flex position="relative" bgColor="white" pr={2}>
            <Text as="p" variant="text-sm" fontWeight={500} color="gray.500">
              {t('modal.login.alternative')}
            </Text>
          </Flex>
        </Box>
      )}

      {error && (
        <Text as="span" role="alert" variant="error" mt={3}>
          {error.message ? error.message : error.toString()}
        </Text>
      )}
      {invalidNetwork && (
        <Text as="span" role="alert" variant="error" mt={3}>
          {t('modal.login.errors.wrong-network', { networkName })}
        </Text>
      )}
      {hasStandardWallet && (
        <Flex direction={{ base: 'column', md: 'row' }} gap={3}>
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
              <WalletMetamask activate={activate} onError={setErrorFromLogin} />
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
              <WalletCoinbase activate={activate} onError={setErrorFromLogin} />
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
                activate={activate}
                onError={setErrorFromLogin}
              />
            </Stack>
          )}
        </Flex>
      )}
    </>
  )
}

export default LoginForm
