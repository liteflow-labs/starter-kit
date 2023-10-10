import {
  Box,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { CancelOfferStep, useCancelOffer } from '@liteflow/react'
import { BiBadgeCheck } from '@react-icons/all-files/bi/BiBadgeCheck'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import useAccount from 'hooks/useAccount'
import useSigner from 'hooks/useSigner'
import useTranslation from 'next-translate/useTranslation'
import { FC, ReactElement, useCallback, useMemo } from 'react'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import { formatError, isSameAddress } from '../../../utils'
import ConnectButtonWithNetworkSwitch from '../../Button/ConnectWithNetworkSwitch'
import CancelOfferModal from '../../Modal/CancelOffer'
import Price from '../../Price/Price'
import SaleOpenEdit from '../Open/Info'

type Sale = {
  id: string
  unitPrice: string
  maker: {
    address: string
  }
  currency: {
    decimals: number
    symbol: string
  }
}

export type Props = {
  assetId: string
  chainId: number
  isOwner: boolean
  isHomepage: boolean
  sales: Sale[]
  onOfferCanceled: (id: string) => Promise<void>
}

// TODO: the logic of this component doesn't seems right. The component mostly renders nothing
const SaleDirectInfo: FC<Props> = ({
  assetId,
  chainId,
  isOwner,
  isHomepage,
  sales,
  onOfferCanceled,
}): ReactElement | null => {
  const { t } = useTranslation('components')
  const signer = useSigner()
  const [cancelOffer, { activeStep, transactionHash }] = useCancelOffer(signer)
  const toast = useToast()
  const { address } = useAccount()
  const blockExplorer = useBlockExplorer(chainId)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleCancel = useCallback(
    async (sale: Sale) => {
      if (!confirm(t('sales.direct.info.cancel-confirmation'))) return
      try {
        onOpen()
        await cancelOffer(sale.id)
        await onOfferCanceled(sale.id)
      } catch (e) {
        toast({
          title: formatError(e),
          status: 'error',
        })
      } finally {
        onClose()
      }
    },
    [t, onOpen, cancelOffer, onOfferCanceled, toast, onClose],
  )

  const cancel = useMemo(() => {
    // Only display cancel when there is a single offer owned by the current account
    if (!address) return null
    const currentAccountFirstSale = sales.find((x) =>
      isSameAddress(x.maker.address, address),
    )
    if (!currentAccountFirstSale) return null

    return (
      <Flex
        gap={6}
        align={{
          base: 'flex-start',
          sm: 'center',
          md: 'flex-start',
          lg: 'center',
        }}
        justify="space-between"
        rounded="xl"
        bg="green.50"
        p={6}
        cursor="pointer"
        direction={{ base: 'column', sm: 'row', md: 'column', lg: 'row' }}
      >
        <Flex align="center" gap={5}>
          <Box>
            <Flex
              align="center"
              justify="center"
              rounded="lg"
              bg="green.500"
              h={8}
              w={8}
            >
              <Icon as={BiBadgeCheck} h={6} w={6} color="white" />
            </Flex>
          </Box>
          <Heading as="h5" variant="heading3" color="gray.500">
            {t('sales.direct.info.price')}
            <Text
              as={Price}
              color="brand.black"
              ml={2}
              fontWeight="semibold"
              amount={currentAccountFirstSale.unitPrice}
              currency={currentAccountFirstSale.currency}
            />
          </Heading>
        </Flex>
        <ConnectButtonWithNetworkSwitch
          chainId={chainId}
          variant="outline"
          colorScheme="gray"
          bgColor="white"
          onClick={() => handleCancel(currentAccountFirstSale)}
          rightIcon={<HiArrowNarrowRight />}
          isLoading={activeStep !== CancelOfferStep.INITIAL}
        >
          <Text as="span" isTruncated>
            {t('sales.direct.info.cancel')}
          </Text>
        </ConnectButtonWithNetworkSwitch>
        <CancelOfferModal
          isOpen={isOpen}
          onClose={onClose}
          title={t('sales.direct.info.cancel')}
          step={activeStep}
          blockExplorer={blockExplorer}
          transactionHash={transactionHash}
        />
      </Flex>
    )
  }, [
    activeStep,
    address,
    blockExplorer,
    chainId,
    handleCancel,
    isOpen,
    onClose,
    sales,
    t,
    transactionHash,
  ])

  const create = useMemo(() => {
    if (!isOwner) return null
    // Hide the create button if we already show the cancel button to avoid having multiple call to action
    // This can be disabled if we want to also let the user create new offers
    if (cancel) return null
    return (
      <SaleOpenEdit
        assetId={assetId}
        isHomepage={isHomepage}
        isOwner={isOwner}
      />
    )
  }, [assetId, isHomepage, isOwner, cancel])

  if (isHomepage) return null
  if (!cancel && !create) return null

  return (
    <Stack w="full" spacing={4}>
      {cancel}
      {create}
    </Stack>
  )
}

export default SaleDirectInfo
