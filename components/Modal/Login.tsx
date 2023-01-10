import {
  Box,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { connectors } from '../../connectors'
import WalletCoinbase from '../Wallet/Connectors/Coinbase'
import WalletMetamask from '../Wallet/Connectors/Metamask'
import WalletWalletConnect from '../Wallet/Connectors/WalletConnect'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const LoginModal: FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('components')
  const { isConnected } = useAccount()
  const [error, setError] = useState<Error>()

  const hasStandardWallet =
    connectors.injected || connectors.coinbase || connectors.walletConnect

  useEffect(() => {
    if (isConnected) onClose()
  }, [isConnected, onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading as="h3" variant="heading1" color="brand.black">
            {t('modal.login.title')}
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text as="p" variant="text" color="gray.500" mb={4}>
            {t('modal.login.description')}
          </Text>

          {/* {email && <WalletEmail connector={email} activate={activate} />} */}
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
                <Text
                  as="p"
                  variant="text-sm"
                  fontWeight={500}
                  color="gray.500"
                >
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
        </ModalBody>
        <ModalFooter as="div" />
      </ModalContent>
    </Modal>
  )
}

export default LoginModal
