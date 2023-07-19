import { ButtonProps, useDisclosure } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { CancelOfferStep, useCancelOffer } from '@liteflow/react'
import { JSX, PropsWithChildren, useCallback } from 'react'
import useBlockExplorer from '../../hooks/useBlockExplorer'
import CancelOfferModal from '../Modal/CancelOffer'
import ConnectButtonWithNetworkSwitch from './ConnectWithNetworkSwitch'

type Props = Omit<ButtonProps, 'onClick' | 'disabled'> & {
  signer: Signer | undefined
  offerId: string
  chainId: number
  title: string
  onCanceled: () => Promise<any>
  onError: (error: Error) => void
}

export default function CancelOfferButton({
  signer,
  onCanceled,
  onError,
  title,
  chainId,
  offerId,
  children,
  ...props
}: PropsWithChildren<Props>): JSX.Element {
  const blockExplorer = useBlockExplorer(chainId)
  const [cancel, { activeStep, transactionHash }] = useCancelOffer(signer)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleCancelOffer = useCallback(async () => {
    try {
      onOpen()
      await cancel(offerId)
      await onCanceled()
    } catch (e) {
      onError(e as Error)
    } finally {
      onClose()
    }
  }, [cancel, onClose, onOpen, onCanceled, offerId, onError])

  return (
    <>
      <ConnectButtonWithNetworkSwitch
        chainId={chainId}
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
