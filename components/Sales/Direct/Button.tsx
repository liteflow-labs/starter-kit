import { Button, Flex, Text, useDisclosure, useToast } from '@chakra-ui/react'
import { CancelOfferStep, useCancelOffer } from '@liteflow/react'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import ConnectButtonWithNetworkSwitch from 'components/Button/ConnectWithNetworkSwitch'
import CancelOfferModal from 'components/Modal/CancelOffer'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback, useMemo } from 'react'
import { useAccount } from 'wagmi'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useSigner from '../../../hooks/useSigner'
import { formatError, isSameAddress } from '../../../utils'
import CheckoutButton from '../../Button/CheckoutButton'
import Link from '../../Link/Link'
import type { Props as ModalProps } from './Modal'
import SaleDirectModal from './Modal'

export type Props = {
  assetId: string
  chainId: number
  isHomepage: boolean
  sales: ModalProps['sales']
  ownAllSupply: boolean
  onOfferCanceled: (id: string) => Promise<void>
}

const SaleDirectButton: FC<Props> = ({
  assetId,
  chainId,
  isHomepage,
  sales,
  ownAllSupply,
  onOfferCanceled,
}) => {
  const { t } = useTranslation('components')
  const signer = useSigner()
  const [cancelOffer, { activeStep, transactionHash }] = useCancelOffer(signer)
  const toast = useToast()
  const { address } = useAccount()
  const blockExplorer = useBlockExplorer(chainId)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleCancel = useCallback(
    async (saleId: string) => {
      if (!confirm(t('sales.direct.info.cancel-confirmation'))) return
      try {
        onOpen()
        await cancelOffer(saleId)
        await onOfferCanceled(saleId)
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
    if (sales.length !== 1) return
    // Only display cancel when there is a single offer owned by the current account
    if (!address) return
    const sale = sales[0]
    if (!sale) return
    const currentAccountFirstSale = isSameAddress(sale.maker.address, address)
    if (!currentAccountFirstSale) return
    return (
      <>
        <ConnectButtonWithNetworkSwitch
          chainId={chainId}
          onClick={() => handleCancel(sale.id)}
          isLoading={activeStep !== CancelOfferStep.INITIAL}
          width="full"
          size="lg"
          variant="outline"
          colorScheme="gray"
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

  const bid = useMemo(() => {
    if (ownAllSupply) return
    return (
      <Button
        as={Link}
        href={`/tokens/${assetId}/bid`}
        variant={cancel ? 'solid' : 'outline'}
        colorScheme={cancel ? undefined : 'gray'}
        size="lg"
        width="full"
      >
        <Text as="span" isTruncated>
          {t('sales.direct.button.place-bid')}
        </Text>
      </Button>
    )
  }, [assetId, cancel, ownAllSupply, t])

  const buyNow = useMemo(() => {
    if (sales.length !== 1) return
    const sale = sales[0]
    if (!sale) return
    // Only display buy now when there is a single offer not owned by the current account
    if (address && isSameAddress(sale.maker.address, address)) return
    return (
      <CheckoutButton offer={sale} size="lg">
        <Text as="span" isTruncated>
          {t('sales.direct.button.buy')}
        </Text>
      </CheckoutButton>
    )
  }, [address, sales, t])

  const seeOffers = useMemo(() => {
    if (sales.length <= 1) return
    return (
      <SaleDirectModal
        chainId={chainId}
        sales={sales}
        onOfferCanceled={onOfferCanceled}
      />
    )
  }, [chainId, sales, onOfferCanceled])

  if (ownAllSupply && isHomepage)
    return (
      <Button
        as={Link}
        href={`/tokens/${assetId}`}
        variant="outline"
        colorScheme="gray"
        bgColor="white"
        width="full"
        rightIcon={<HiArrowNarrowRight />}
      >
        <Text as="span" isTruncated>
          {t('sales.direct.button.view')}
        </Text>
      </Button>
    )

  if (!cancel && !bid && !buyNow && !seeOffers) return null

  return (
    <Flex gap={6} direction={{ base: 'column', md: 'row' }}>
      {cancel}
      {bid}
      {buyNow}
      {seeOffers}
    </Flex>
  )
}

export default SaleDirectButton
