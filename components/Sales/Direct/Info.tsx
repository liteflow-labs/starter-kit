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
import { Signer } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import {
  CancelOfferStep,
  formatError,
  isSameAddress,
  useCancelOffer,
} from '@nft/hooks'
import { BiBadgeCheck } from '@react-icons/all-files/bi/BiBadgeCheck'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import useTranslation from 'next-translate/useTranslation'
import { ReactElement, useCallback, useMemo, VFC } from 'react'
import { BlockExplorer } from '../../../hooks/useBlockExplorer'
import ButtonWithNetworkSwitch from '../../Button/SwitchNetwork'
import CancelOfferModal from '../../Modal/CancelOffer'
import Price from '../../Price/Price'
import SaleOpenEdit from '../Open/Info'

export type Props = {
  assetId: string
  chainId: number
  blockExplorer: BlockExplorer
  isOwner: boolean
  isHomepage: boolean
  signer: Signer | undefined
  currentAccount: string | null | undefined
  sales: {
    id: string
    unitPrice: BigNumber
    expiredAt: Date | null | undefined
    maker: {
      address: string
    }
    currency: {
      decimals: number
      symbol: string
    }
  }[]
  onOfferCanceled: (id: string) => Promise<void>
}

// TODO: the logic of this component doesn't seems right. The component mostly renders nothing
const SaleDirectInfo: VFC<Props> = ({
  assetId,
  chainId,
  blockExplorer,
  isOwner,
  isHomepage,
  sales,
  signer,
  currentAccount,
  onOfferCanceled,
}): ReactElement | null => {
  const { t } = useTranslation('components')
  const [cancelOffer, { activeStep, transactionHash }] = useCancelOffer(signer)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleCancel = useCallback(
    async (sale: typeof sales[0]) => {
      if (!confirm(t('sales.direct.info.cancel-confirmation'))) return
      try {
        onOpen()
        await cancelOffer(sale)
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
    if (!currentAccount) return null
    const currentAccountFirstSale = sales.find((x) =>
      isSameAddress(x.maker.address, currentAccount),
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
            {currentAccountFirstSale && (
              <Text
                as={Price}
                color="brand.black"
                ml={2}
                fontWeight="semibold"
                amount={currentAccountFirstSale.unitPrice}
                currency={currentAccountFirstSale.currency}
              />
            )}
          </Heading>
        </Flex>
        <ButtonWithNetworkSwitch
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
        </ButtonWithNetworkSwitch>
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
    currentAccount,
    sales,
    t,
    activeStep,
    isOpen,
    onClose,
    blockExplorer,
    transactionHash,
    handleCancel,
    chainId,
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
