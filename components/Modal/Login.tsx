import {
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react'
import { useWeb3React } from '@web3-react/core'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect } from 'react'
import LoginForm from '../Login/Form'

type Props = {
  isOpen: boolean
  onClose: () => void
  networkName: string
}

const LoginModal: FC<Props> = ({ isOpen, onClose, networkName }) => {
  const { t } = useTranslation('components')
  const { account, activate } = useWeb3React()

  useEffect(() => {
    if (account) onClose()
  }, [account, onClose])

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

          <LoginForm activate={activate} networkName={networkName} />
        </ModalBody>
        <ModalFooter as="div" />
      </ModalContent>
    </Modal>
  )
}

export default LoginModal
