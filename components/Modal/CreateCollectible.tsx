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
  Stack,
  Text,
} from '@chakra-ui/react'
import { CreateNftStep } from '@liteflow/react'
import { CgArrowLongRight } from '@react-icons/all-files/cg/CgArrowLongRight'
import { HiCheck } from '@react-icons/all-files/hi/HiCheck'
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import { BlockExplorer } from '../../hooks/useBlockExplorer'
import Link from '../Link/Link'

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  step: CreateNftStep
  blockExplorer: BlockExplorer
  transactionHash: string | undefined
  isLazyMint: boolean
}

const CreateCollectibleModal: FC<Props> = ({
  isOpen,
  onClose,
  title,
  step,
  blockExplorer,
  transactionHash,
  isLazyMint,
}) => {
  const { t } = useTranslation('components')
  const upload = useMemo(() => {
    switch (step) {
      case CreateNftStep.UPLOAD:
        return {
          title: t('modal.create-collectible.upload.upload.title'),
          description: t('modal.create-collectible.upload.upload.description'),
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
      case CreateNftStep.TRANSACTION_SIGNATURE:
      case CreateNftStep.TRANSACTION_PENDING:
      case CreateNftStep.OWNERSHIP:
      case CreateNftStep.LAZYMINT_SIGNATURE:
      case CreateNftStep.LAZYMINT_PENDING:
        return {
          title: t('modal.create-collectible.upload.default.title'),
          description: t('modal.create-collectible.upload.default.description'),
          icon: <Icon as={HiCheck} h={7} w={7} color="green.500" />,
        }
      default:
        return null
    }
  }, [step, t])

  const transaction = useMemo(() => {
    switch (step) {
      case CreateNftStep.UPLOAD:
        return {
          title: t(
            isLazyMint
              ? 'modal.create-collectible.transaction.lazymint-signature.title'
              : 'modal.create-collectible.transaction.upload.title',
          ),
          description: t(
            isLazyMint
              ? 'modal.create-collectible.transaction.lazymint-signature.description'
              : 'modal.create-collectible.transaction.upload.description',
          ),
          icon: <Icon as={CgArrowLongRight} h="22px" w="22px" />,
        }
      case CreateNftStep.TRANSACTION_SIGNATURE:
        return {
          title: t('modal.create-collectible.transaction.signature.title'),
          description: t(
            'modal.create-collectible.transaction.signature.description',
          ),
          icon: (
            <Icon as={CgArrowLongRight} h="22px" w="22px" color="brand.500" />
          ),
        }
      case CreateNftStep.TRANSACTION_PENDING:
        return {
          title: t('modal.create-collectible.transaction.pending.title'),
          description: t(
            'modal.create-collectible.transaction.pending.description',
          ),
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
      case CreateNftStep.OWNERSHIP:
        return {
          title: t('modal.create-collectible.transaction.ownership.title'),
          description: t(
            'modal.create-collectible.transaction.ownership.description',
          ),
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
      case CreateNftStep.LAZYMINT_SIGNATURE:
        return {
          title: t(
            'modal.create-collectible.transaction.lazymint-signature.title',
          ),
          description: t(
            'modal.create-collectible.transaction.lazymint-signature.description',
          ),
          icon: (
            <Icon as={CgArrowLongRight} h="22px" w="22px" color="brand.500" />
          ),
        }
      case CreateNftStep.LAZYMINT_PENDING:
        return {
          title: t(
            'modal.create-collectible.transaction.lazymint-pending.title',
          ),
          description: t(
            'modal.create-collectible.transaction.lazymint-pending.description',
          ),
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
  }, [isLazyMint, step, t])

  if (step === CreateNftStep.INITIAL) return null
  if (!upload || !transaction) return null

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
            {title}
          </Heading>
        </ModalHeader>
        <ModalBody>
          <Text as="p" variant="text" color="gray.500" mb={4}>
            {t(
              isLazyMint
                ? 'modal.create-collectible.description-lazymint'
                : 'modal.create-collectible.description',
            )}
          </Text>

          <Stack spacing={4}>
            <Flex align="center" gap={3}>
              <Flex align="center" justify="center" h="44px" w="44px">
                {upload.icon}
              </Flex>
              <Box flex={1}>
                <Heading as="h4" variant="heading2" color="brand.black">
                  {upload.title}
                </Heading>
                <Text as="p" variant="text-sm" color="gray.500">
                  {upload.description}
                </Text>
              </Box>
            </Flex>

            <Flex
              align="center"
              gap={3}
              opacity={step === CreateNftStep.UPLOAD ? '.4' : undefined}
            >
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
          </Stack>
        </ModalBody>
        {!isLazyMint && (
          <ModalBody>
            <Divider />
          </ModalBody>
        )}
        <ModalFooter as="div">
          {!isLazyMint && (
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
                {t('modal.create-collectible.action', blockExplorer)}
              </Text>
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateCollectibleModal
