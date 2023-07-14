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
import { CreateOfferStep } from '@liteflow/react'
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
  step: CreateOfferStep
  blockExplorer: BlockExplorer
  transactionHash: string | undefined
}

const CreateOfferModal: FC<Props> = ({
  isOpen,
  onClose,
  title,
  step,
  blockExplorer,
  transactionHash,
}) => {
  const { t } = useTranslation('components')
  const approval = useMemo(() => {
    switch (step) {
      case CreateOfferStep.APPROVAL_SIGNATURE:
        return {
          title: t('modal.create-offer.approval.approval.title'),
          description: t('modal.create-offer.approval.approval.description'),
          icon: (
            <Icon as={CgArrowLongRight} color="brand.500" h="22px" w="22px" />
          ),
        }
      case CreateOfferStep.APPROVAL_PENDING:
        return {
          title: t('modal.create-offer.approval.pending.title'),
          description: t('modal.create-offer.approval.pending.description'),
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
      case CreateOfferStep.SIGNATURE:
        return {
          title: t('modal.create-offer.approval.signature.title'),
          description: t('modal.create-offer.approval.signature.description'),
          icon: <Icon as={HiCheck} w={7} h={7} color="green.500" />,
        }
      default:
        return null
    }
  }, [step, t])

  const signature = useMemo(() => {
    switch (step) {
      case CreateOfferStep.APPROVAL_SIGNATURE:
      case CreateOfferStep.APPROVAL_PENDING:
        return {
          title: t('modal.create-offer.signature.pending.title'),
          description: t('modal.create-offer.signature.pending.description'),
          icon: <Icon as={CgArrowLongRight} h="22px" w="22px" />,
        }
      case CreateOfferStep.SIGNATURE:
        return {
          title: t('modal.create-offer.signature.signature.title'),
          description: t('modal.create-offer.signature.signature.description'),
          icon: (
            <Icon as={CgArrowLongRight} h="22px" w="22px" color="brand.500" />
          ),
        }
      default:
        return null
    }
  }, [step, t])

  if (step === CreateOfferStep.INITIAL) return null
  if (!approval || !signature) return null

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
            {t('modal.create-offer.description')}
          </Text>

          <Stack spacing={4}>
            <Flex align="center" gap={3}>
              <Flex align="center" justify="center" h="44px" w="44px">
                {approval.icon}
              </Flex>
              <Box flex={1}>
                <Heading as="h4" variant="heading2" color="brand.black">
                  {approval.title}
                </Heading>
                <Text as="p" variant="text-sm" color="gray.500">
                  {approval.description}
                </Text>
              </Box>
            </Flex>

            <Flex
              align="center"
              gap={3}
              opacity={step !== CreateOfferStep.SIGNATURE ? '.4' : undefined}
            >
              <Flex align="center" justify="center" h="44px" w="44px">
                {signature.icon}
              </Flex>
              <Box flex={1}>
                <Heading as="h4" variant="heading2" color="brand.black">
                  {signature.title}
                </Heading>
                <Text as="p" variant="text-sm" color="gray.500">
                  {signature.description}
                </Text>
              </Box>
            </Flex>
          </Stack>
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
              {t('modal.create-offer.action', blockExplorer)}
            </Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateOfferModal
