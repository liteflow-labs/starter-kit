import {
  Button,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react'
import { FaFileSignature } from '@react-icons/all-files/fa/FaFileSignature'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback } from 'react'
import { Connector, useDisconnect } from 'wagmi'
import useAccount from '../../hooks/useAccount'

type Props = {
  connector?: Connector
  isOpen: boolean
  onClose: () => void
}

const SignModal: FC<Props> = ({ connector, isOpen, onClose }) => {
  const { t } = useTranslation('components')
  const { sign } = useAccount()
  const { disconnect } = useDisconnect()

  const onSign = useCallback(async () => {
    if (!connector) return
    try {
      await sign(connector)
    } catch (e: any) {
      disconnect()
    } finally {
      onClose()
    }
  }, [connector, disconnect, onClose, sign])

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose()
        disconnect()
      }}
      isCentered
      size="sm"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading as="h3" variant="heading1" color="brand.black">
            {t('modal.signature.title')}
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center">
          <Icon as={FaFileSignature} w={12} h={12} color="green.500" />
          <Heading variant="heading1">{t('modal.signature.sub-title')}</Heading>
          <Text variant="text-sm">{t('modal.signature.description')}</Text>
        </ModalBody>
        <ModalFooter as="div">
          {/* TODO: add loader */}
          <Button onClick={onSign} mx="auto" size="md">
            {t('modal.signature.action')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SignModal
