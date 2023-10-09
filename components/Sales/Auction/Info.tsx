import {
  Button,
  Flex,
  Heading,
  Icon,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { BigNumberish } from '@ethersproject/bignumber'
import { useAcceptAuction, useAuctionStatus } from '@liteflow/react'
import { BiBadgeCheck } from '@react-icons/all-files/bi/BiBadgeCheck'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import useTranslation from 'next-translate/useTranslation'
import { FC, ReactElement, useCallback, useMemo, useState } from 'react'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useSigner from '../../../hooks/useSigner'
import { formatError } from '../../../utils'
import ConnectButtonWithNetworkSwitch from '../../Button/ConnectWithNetworkSwitch'
import Link from '../../Link/Link'
import AcceptAuctionModal from '../../Modal/AcceptAuction'
import Price from '../../Price/Price'

export type Props = {
  assetId: string
  chainId: number
  auction: {
    id: string
    endAt: Date
    expireAt: Date
    reserveAmount: string
    currency: {
      decimals: number
      image: string
      symbol: string
    }
    winningOffer: { id: string } | null | undefined
  }
  bestAuctionBid:
    | {
        amount: BigNumberish
      }
    | undefined
  isOwner: boolean
  isHomepage: boolean
  onAuctionAccepted: (id: string) => Promise<void>
}

const SaleAuctionInfo: FC<Props> = ({
  assetId,
  chainId,
  auction,
  bestAuctionBid,
  isOwner,
  isHomepage,
  onAuctionAccepted,
}): ReactElement | null => {
  const { t } = useTranslation('components')
  const signer = useSigner()
  const [_acceptAuction, { activeStep, transactionHash }] =
    useAcceptAuction(signer)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    inProgress,
    endedAndWaitingForTransfer,
    hasBids,
    bellowReservePrice,
    reservePriceMatches,
  } = useAuctionStatus(auction, bestAuctionBid)
  const blockExplorer = useBlockExplorer(chainId)

  const acceptAuction = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      onOpen()
      await _acceptAuction(auction.id)
      await onAuctionAccepted(auction.id)
    } catch (e) {
      toast({
        title: formatError(e),
        status: 'error',
      })
    } finally {
      setLoading(false)
      onClose()
    }
  }, [_acceptAuction, auction.id, onAuctionAccepted, onClose, onOpen, toast])

  const info = useMemo(() => {
    if (inProgress) {
      return {
        type: 'success',
        icon: <Icon as={BiBadgeCheck} h={6} w={6} color="white" />,
        title: (
          <>
            {t('sales.auction.info.reserve')}
            <Text
              as={Price}
              color="brand.black"
              ml={2}
              fontWeight="semibold"
              amount={auction.reserveAmount}
              currency={auction.currency}
            />
          </>
        ),
      }
    }
    if (endedAndWaitingForTransfer && !hasBids) {
      return {
        type: 'success',
        icon: <Icon as={BiBadgeCheck} h={6} w={6} color="white" />,
        title: t('sales.auction.info.no-bids.title'),
        action: (
          <Button
            as={Link}
            variant="outline"
            colorScheme="gray"
            bgColor="white"
            href={`/tokens/${assetId}/offer`}
            rightIcon={<HiArrowNarrowRight />}
          >
            <Text as="span" isTruncated>
              {t('sales.auction.info.no-bids.action')}
            </Text>
          </Button>
        ),
      }
    }
    if (endedAndWaitingForTransfer && bellowReservePrice) {
      return {
        type: 'success',
        icon: <Icon as={BiBadgeCheck} h={6} w={6} color="white" />,
        title: t('sales.auction.info.no-reserve.title'),
        action: (
          <Button
            as={Link}
            variant="outline"
            colorScheme="gray"
            bgColor="white"
            href={`/tokens/${assetId}/offer`}
            rightIcon={<HiArrowNarrowRight />}
          >
            <Text as="span" isTruncated>
              {t('sales.auction.info.no-reserve.action')}
            </Text>
          </Button>
        ),
      }
    }
    if (endedAndWaitingForTransfer && reservePriceMatches) {
      return {
        type: 'success',
        icon: <Icon as={BiBadgeCheck} h={6} w={6} color="white" />,
        title: t('sales.auction.info.with-reserve.title'),
        action: (
          <ConnectButtonWithNetworkSwitch
            chainId={chainId}
            variant="outline"
            colorScheme="gray"
            bgColor="white"
            onClick={acceptAuction}
            isLoading={loading}
            rightIcon={<HiArrowNarrowRight />}
          >
            <Text as="span" isTruncated>
              {t('sales.auction.info.with-reserve.action')}
            </Text>
          </ConnectButtonWithNetworkSwitch>
        ),
      }
    }
  }, [
    acceptAuction,
    assetId,
    auction.currency,
    auction.reserveAmount,
    bellowReservePrice,
    chainId,
    endedAndWaitingForTransfer,
    hasBids,
    inProgress,
    loading,
    reservePriceMatches,
    t,
  ])

  if (!isOwner) return null
  if (isHomepage) return null
  if (!info) return null
  return (
    <Flex
      align="center"
      justify="space-between"
      rounded="xl"
      p={6}
      bgColor={info.type === 'success' ? 'green.50' : undefined}
    >
      <Flex align="center">
        <Flex
          as="span"
          mr={5}
          h={8}
          w={8}
          align="center"
          justify="center"
          rounded="lg"
          bgColor={info.type === 'success' ? 'green.500' : undefined}
        >
          {info.icon}
        </Flex>
        <Heading as="h5" variant="heading3" color="gray.500">
          {info.title}
        </Heading>
      </Flex>

      {info.action}

      <AcceptAuctionModal
        isOpen={isOpen}
        onClose={onClose}
        title={t('sales.auction.info.title')}
        step={activeStep}
        blockExplorer={blockExplorer}
        transactionHash={transactionHash}
      />
    </Flex>
  )
}

export default SaleAuctionInfo
