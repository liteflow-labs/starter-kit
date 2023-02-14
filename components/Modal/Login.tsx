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
import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect } from 'react'
import useAccount from '../../hooks/useAccount'
import LoginForm from '../Login/Form'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const LoginModal: FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('components')
  const { isLoggedIn } = useAccount()

  useEffect(() => {
    if (isLoggedIn) onClose()
  }, [isLoggedIn, onClose])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="xl"
      trapFocus={false} // Allow to have a focusable element outside the modal (for the email modal)
    >
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
