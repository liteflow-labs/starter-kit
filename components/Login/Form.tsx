import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useState } from 'react'
import { connectors } from '../../connectors'
import WalletCoinbase from '../Wallet/Connectors/Coinbase'
import WalletMetamask from '../Wallet/Connectors/Metamask'
import WalletWalletConnect from '../Wallet/Connectors/WalletConnect'

const LoginForm: FC<{}> = () => {
  const { t } = useTranslation('components')
  const [error, setError] = useState<Error>()

  const hasStandardWallet =
    connectors.injected || connectors.coinbase || connectors.walletConnect

  return (
    <>
      {/* {email && <WalletEmail connector={email} activate={activate} />} */}
      {connectors.email && hasStandardWallet && (
        <Flex position="relative" mt={6} mb={2}>
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
        </Flex>
      )}

      {error && (
        <Text as="span" role="alert" variant="error" mt={3}>
          {error.message ? error.message : error.toString()}
        </Text>
      )}

      {hasStandardWallet && (
        <Flex direction={{ base: 'column', md: 'row' }} gap={3} mt={6}>
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
                onError={setError}
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
                onError={setError}
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
                onError={setError}
              />
            </Stack>
          )}
        </Flex>
      )}
    </>
  )
}

export default LoginForm
