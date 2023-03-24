import {
  Box,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { FC } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const WelcomeModal: FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('components')

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader alignItems="center" flexDirection="row" pr={10}>
          <Heading as="h3" variant="heading1" color="brand.black">
            {t('welcomeModal.title')}
          </Heading>
          <ModalCloseButton m={2} />
        </ModalHeader>

        <ModalBody>
          <Box
            position="relative"
            w="100%"
            height={200}
            borderRadius={20}
            overflow="hidden"
          >
            <Image
              src="/defy-welcome.webp"
              alt="DEFY welcome image"
              layout="fill"
              objectFit="cover"
            />
          </Box>

          <Text
            as="p"
            variant="text"
            color="gray.500"
            my={8}
            whiteSpace="pre-line"
          >
            {t('welcomeModal.description')}
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default WelcomeModal
