import { Button, Text, useDisclosure, useToast } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import {
  AcceptAuctionStep,
  useAcceptAuction,
  useAuctionStatus,
} from '@liteflow/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback, useMemo } from 'react'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useSigner from '../../../hooks/useSigner'
import { formatError } from '../../../utils'
import Link from '../../Link/Link'
import AcceptAuctionModal from '../../Modal/AcceptAuction'

export type Props = {
  auction: {
    id: string
    endAt: string | Date
    expireAt: string | Date
    reserveAmount: BigNumber
    winningOffer: { id: string } | null | undefined
    asset: {
      id: string
      chainId: number
    }
    bestBid:
      | {
          amount: BigNumber
        }
      | undefined
  }
  onAuctionAccepted: (id: string) => void
}

const SaleAuctionAction: FC<Props> = ({ auction, onAuctionAccepted }) => {
  const { t } = useTranslation('components')
  const signer = useSigner()
  const blockExplorer = useBlockExplorer(auction.asset.chainId)
  const { inProgress, endedAndWaitingForTransfer, reservePriceMatches } =
    useAuctionStatus(auction, auction.bestBid)
  const [accept, { activeStep, transactionHash }] = useAcceptAuction(signer)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleAcceptAuction = useCallback(
    async (id: string) => {
      try {
        onOpen()
        await accept(id)
        onAuctionAccepted(id)
      } catch (e) {
        toast({
          title: formatError(e),
          status: 'error',
        })
      } finally {
        onClose()
      }
    },
    [accept, onAuctionAccepted, onClose, onOpen, toast],
  )

  const button = useMemo(() => {
    if (inProgress)
      return (
        <Button variant="outline" colorScheme="gray" disabled>
          <Text as="span" isTruncated>
            {t('sales.auction.action.cancel')}
          </Text>
        </Button>
      )
    if (endedAndWaitingForTransfer && reservePriceMatches)
      return (
        <Button
          isLoading={activeStep !== AcceptAuctionStep.INITIAL}
          onClick={() => handleAcceptAuction(auction.id)}
        >
          <Text as="span" isTruncated>
            {t('sales.auction.action.accept')}
          </Text>
        </Button>
      )
    return (
      <Button
        as={Link}
        href={`/tokens/${auction.asset.id}/offer`}
        variant="outline"
        colorScheme="gray"
      >
        <Text as="span" isTruncated>
          {t('sales.auction.action.new-sale')}
        </Text>
      </Button>
    )
  }, [
    auction,
    handleAcceptAuction,
    activeStep,
    endedAndWaitingForTransfer,
    reservePriceMatches,
    inProgress,
    t,
  ])

  return (
    <>
      {button}
      <AcceptAuctionModal
        isOpen={isOpen}
        onClose={onClose}
        title={t('sales.auction.action.title')}
        step={activeStep}
        blockExplorer={blockExplorer}
        transactionHash={transactionHash}
      />
    </>
  )
}

export default SaleAuctionAction
