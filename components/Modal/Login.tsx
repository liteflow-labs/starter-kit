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
import LoginForm from 'components/Login/Form'
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect } from 'react'
import { useAccount } from 'wagmi'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const LoginModal: FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('components')
  const { isConnected } = useAccount()

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

          <LoginForm />
        </ModalBody>
        <ModalFooter as="div" />
      </ModalContent>
    </Modal>
  )
}

export default LoginModal
