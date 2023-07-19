import { ButtonProps, useDisclosure } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { BigNumberish } from '@ethersproject/bignumber'
import { AcceptOfferStep, useAcceptOffer } from '@liteflow/react'
import { JSX, PropsWithChildren, useCallback } from 'react'
import useBlockExplorer from '../../hooks/useBlockExplorer'
import AcceptOfferModal from '../Modal/AcceptOffer'
import ConnectButtonWithNetworkSwitch from './ConnectWithNetworkSwitch'

type Props = Omit<ButtonProps, 'onClick' | 'disabled'> & {
  signer: Signer | undefined
  offer: {
    id: string
    unitPrice: BigNumberish
  }
  quantity: BigNumberish
  chainId: number
  title: string
  onAccepted: () => Promise<any>
  onError: (error: Error) => void
}

export default function AcceptOfferButton({
  signer,
  onAccepted,
  onError,
  title,
  chainId,
  offer,
  quantity,
  children,
  ...props
}: PropsWithChildren<Props>): JSX.Element {
  const blockExplorer = useBlockExplorer(chainId)
  const [accept, { activeStep, transactionHash }] = useAcceptOffer(signer)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleAcceptOffer = useCallback(async () => {
    try {
      onOpen()
      await accept(offer.id, quantity)
      await onAccepted()
    } catch (e) {
      onError(e as Error)
    } finally {
      onClose()
    }
  }, [accept, onClose, onOpen, onAccepted, offer, quantity, onError])

  return (
    <>
      <ConnectButtonWithNetworkSwitch
        chainId={chainId}
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
