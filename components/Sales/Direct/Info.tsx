import { Stack, Text, useDisclosure, useToast } from '@chakra-ui/react'
import { CancelOfferStep, useCancelOffer } from '@liteflow/react'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import useAccount from 'hooks/useAccount'
import useSigner from 'hooks/useSigner'
import useTranslation from 'next-translate/useTranslation'
import { FC, ReactElement, useCallback, useMemo } from 'react'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import { formatError, isSameAddress } from '../../../utils'
import ConnectButtonWithNetworkSwitch from '../../Button/ConnectWithNetworkSwitch'
import CancelOfferModal from '../../Modal/CancelOffer'
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
    const currentAccountSales = sales.filter((x) =>
      isSameAddress(x.maker.address, address),
    )
    if (currentAccountSales.length !== 1 || sales.length !== 1) return null

    const currentAccountFirstSale = sales[0]
    if (!currentAccountFirstSale) return null

    return (
      <>
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
      </>
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
    return (
      <SaleOpenEdit
        assetId={assetId}
        isHomepage={isHomepage}
        isOwner={isOwner}
      />
    )
  }, [assetId, isHomepage, isOwner])

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
