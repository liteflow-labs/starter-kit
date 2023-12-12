import { ButtonProps, useDisclosure } from '@chakra-ui/react'
import { CancelOfferStep, useCancelOffer } from '@liteflow/react'
import { JSX, PropsWithChildren, useCallback } from 'react'
import useBlockExplorer from '../../hooks/useBlockExplorer'
import useSigner from '../../hooks/useSigner'
import CancelOfferModal from '../Modal/CancelOffer'
import ConnectButtonWithNetworkSwitch from './ConnectWithNetworkSwitch'

type Props = Omit<ButtonProps, 'onClick' | 'disabled'> & {
  offer: {
    id: string
    asset: {
      chainId: number
    }
  }
  title: string
  onCanceled: () => Promise<any>
  onError: (error: Error) => void
}

export default function CancelOfferButton({
  children,
  offer,
  title,
  onCanceled,
  onError,
  ...props
}: PropsWithChildren<Props>): JSX.Element {
  const signer = useSigner()
  const blockExplorer = useBlockExplorer(offer.asset.chainId)
  const [cancel, { activeStep, transactionHash }] = useCancelOffer(signer)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleCancelOffer = useCallback(async () => {
    try {
      onOpen()
      await cancel(offer.id)
      await onCanceled()
    } catch (e) {
      onError(e as Error)
    } finally {
      onClose()
    }
  }, [cancel, offer.id, onCanceled, onClose, onError, onOpen])

  return (
    <>
      <ConnectButtonWithNetworkSwitch
        chainId={offer.asset.chainId}
        {...props}
        isLoading={activeStep !== CancelOfferStep.INITIAL}
        onClick={handleCancelOffer}
      >
        {children}
      </ConnectButtonWithNetworkSwitch>
      <CancelOfferModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        step={activeStep}
        blockExplorer={blockExplorer}
        transactionHash={transactionHash}
      />
    </>
  )
}
