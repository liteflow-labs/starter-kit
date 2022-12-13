import {
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import React, { VFC } from 'react'
import List from '../../List/List'
import OwnersModalActivator from './ModalActivator'
import OwnersModalItem from './ModalItem'

export type Props = {
  owners: {
    address: string
    image: string | null | undefined
    name: string | null | undefined
    verified: boolean
    quantity: string
  }[]
}

const OwnersModal: VFC<Props> = ({ owners }) => {
  const { t } = useTranslation('components')
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <OwnersModalActivator owners={owners} onClick={onOpen} />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex>
              {t('token.owners.title')}
              <Flex
                bgColor="brand.50"
                my="auto"
                ml={3}
                align="center"
                justify="center"
                rounded="lg"
                py={0.5}
                px={2.5}
              >
                <Text as="span" variant="caption" color="brand.500">
                  {owners.length}
                </Text>
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <List>
              {owners.map((owner) => (
                <OwnersModalItem key={owner.address} {...owner} />
              ))}
            </List>
          </ModalBody>
          <ModalFooter as="div" />
        </ModalContent>
      </Modal>
    </>
  )
}

export default OwnersModal
