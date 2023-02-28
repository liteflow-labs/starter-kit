import {
  Button,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import Link from '../Link/Link'

type Props = {
  isOpen: boolean
  onClose: () => void
  baseUrl: string
}

const MetamaskMobileModal: FC<Props> = ({ isOpen, onClose, baseUrl }) => {
  const { t } = useTranslation('components')
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      isCentered
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading as="h3" variant="heading1" color="brand.black">
            {t('modal.login.title')}
          </Heading>
        </ModalHeader>
        <ModalBody>
          <Text as="p" variant="text" color="gray.500" mb={4}>
            {t('modal.login.description')}
          </Text>
        </ModalBody>
        <ModalFooter as="div">
          <Button
            as={Link}
            href={`https://metamask.app.link/dapp/${baseUrl}`}
            isExternal
            variant="outline"
            colorScheme="gray"
            isFullWidth
          >
            <Text as="span" isTruncated>
              Redirect to metamask store
            </Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MetamaskMobileModal
