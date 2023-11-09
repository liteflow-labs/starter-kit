import { ButtonProps, useDisclosure } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { AcceptOfferStep, useAcceptOffer } from '@liteflow/react'
import { JSX, PropsWithChildren, useCallback } from 'react'
import useBlockExplorer from '../../hooks/useBlockExplorer'
import useSigner from '../../hooks/useSigner'
import AcceptOfferModal from '../Modal/AcceptOffer'
import ConnectButtonWithNetworkSwitch from './ConnectWithNetworkSwitch'

type Props = Omit<ButtonProps, 'onClick' | 'disabled'> & {
  offer: {
    id: string
    availableQuantity: string
    asset: {
      chainId: number
    }
  }
  title: string
  onAccepted: () => Promise<any>
  onError: (error: Error) => void
}

export default function AcceptOfferButton({
  children,
  offer,
  title,
  onAccepted,
  onError,
  ...props
}: PropsWithChildren<Props>): JSX.Element {
  const signer = useSigner()
  const blockExplorer = useBlockExplorer(offer.asset.chainId)
  const [accept, { activeStep, transactionHash }] = useAcceptOffer(signer)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleAcceptOffer = useCallback(async () => {
    try {
      onOpen()
      await accept(offer.id, BigNumber.from(offer.availableQuantity))
      await onAccepted()
    } catch (e) {
      onError(e as Error)
    } finally {
      onClose()
    }
  }, [accept, onClose, onOpen, onAccepted, offer, onError])

  return (
    <>
      <ConnectButtonWithNetworkSwitch
        chainId={offer.asset.chainId}
        {...props}
        isLoading={activeStep !== AcceptOfferStep.INITIAL}
        onClick={handleAcceptOffer}
      >
        {children}
      </ConnectButtonWithNetworkSwitch>
      <AcceptOfferModal
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
