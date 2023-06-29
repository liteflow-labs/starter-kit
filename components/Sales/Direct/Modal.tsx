import {
  Button,
  Heading,
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
import { Signer } from '@ethersproject/abstract-signer'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { BlockExplorer } from '../../../hooks/useBlockExplorer'
import List from '../../List/List'
import type { Props as ItemProps } from './ModalItem'
import SaleDirectModalItem from './ModalItem'

export type Props = {
  blockExplorer: BlockExplorer
  signer: Signer | undefined
  currentAccount: string | null | undefined
  sales: (ItemProps['sale'] & { currency: { id: string } })[]
  chainId: number
  onOfferCanceled: (id: string) => Promise<void>
}

const SaleDirectModal: FC<Props> = ({
  blockExplorer,
  signer,
  currentAccount,
  sales,
  chainId,
  onOfferCanceled,
}) => {
  const { t } = useTranslation('components')
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Button size="lg" onClick={onOpen} width="full">
        <Text as="span" isTruncated>
          {t('sales.direct.modal.button')}
        </Text>
      </Button>
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
            <Heading as="h3" variant="heading1" color="brand.black">
              {t('sales.direct.modal.title')}
            </Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <List>
              {sales.map((sale, i) => (
                <>
                  {i > 0 && sales[i - 1]?.currency.id !== sale.currency.id && (
                    <hr />
                  )}
                  <SaleDirectModalItem
                    key={sale.id}
                    chainId={chainId}
                    sale={sale}
                    blockExplorer={blockExplorer}
                    signer={signer}
                    currentAccount={currentAccount}
                    onOfferCanceled={onOfferCanceled}
                  />
                </>
              ))}
            </List>
          </ModalBody>
          <ModalFooter as="div" />
        </ModalContent>
      </Modal>
    </>
  )
}

export default SaleDirectModal
