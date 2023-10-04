import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { MintDropStep } from '@liteflow/react'
import { CgArrowLongRight } from '@react-icons/all-files/cg/CgArrowLongRight'
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import { BlockExplorer } from '../../hooks/useBlockExplorer'
import Link from '../Link/Link'

type Props = {
  isOpen: boolean
  onClose: () => void
  step: MintDropStep
  blockExplorer: BlockExplorer
  transactionHash: string | undefined
}

const MintDropModal: FC<Props> = ({
  isOpen,
  onClose,
  step,
  blockExplorer,
  transactionHash,
}) => {
  const { t } = useTranslation('components')
  const transaction = useMemo(() => {
    switch (step) {
      case MintDropStep.TRANSACTION_SIGNATURE:
        return {
          title: t('modal.drop.transaction.signature.title'),
          description: t('modal.drop.transaction.signature.description'),
          icon: (
            <Icon as={CgArrowLongRight} h="22px" w="22px" color="brand.500" />
          ),
        }
      case MintDropStep.TRANSACTION_PENDING:
        return {
          title: t('modal.drop.transaction.pending.title'),
          description: t('modal.drop.transaction.pending.description'),
          icon: (
            <Spinner
              color="brand.500"
              h={6}
              w={6}
              thickness="2px"
              speed="0.65s"
            />
          ),
        }
      case MintDropStep.OWNERSHIP:
        return {
          title: t('modal.drop.transaction.ownership.title'),
          description: t('modal.drop.transaction.ownership.description'),
          icon: (
            <Spinner
              color="brand.500"
              h={6}
              w={6}
              thickness="2px"
              speed="0.65s"
            />
          ),
        }
      default:
        return null
    }
  }, [step, t])

  if (step === MintDropStep.INITIAL) return null
  if (!transaction) return null

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
            {t('modal.drop.title')}
          </Heading>
        </ModalHeader>
        <ModalBody>
          <Text as="p" variant="text" color="gray.500" mb={4}>
            {t('modal.drop.description')}
          </Text>

          <Flex align="center" gap={3}>
            <Flex align="center" justify="center" h="44px" w="44px">
              {transaction.icon}
            </Flex>
            <Box flex={1}>
              <Heading as="h4" variant="heading2" color="brand.black">
                {transaction.title}
              </Heading>
              <Text as="p" variant="text-sm" color="gray.500">
                {transaction.description}
              </Text>
            </Box>
          </Flex>
        </ModalBody>
        <ModalBody>
          <Divider />
        </ModalBody>
        <ModalFooter as="div">
          <Button
            as={Link}
            href={blockExplorer.transaction(transactionHash) || ''}
            isExternal
            variant="outline"
            colorScheme="gray"
            width="full"
            rightIcon={<HiOutlineExternalLink />}
            isDisabled={!transactionHash}
          >
            <Text as="span" isTruncated>
              {t('modal.drop.action', blockExplorer)}
            </Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MintDropModal
