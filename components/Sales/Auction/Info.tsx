import {
  Button,
  Flex,
  Heading,
  Icon,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import { formatError, useAcceptAuction } from '@nft/hooks'
import { BiBadgeCheck } from '@react-icons/all-files/bi/BiBadgeCheck'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import useTranslation from 'next-translate/useTranslation'
import { ReactElement, useCallback, useMemo, useState, VFC } from 'react'
import { BlockExplorer } from '../../../hooks/useBlockExplorer'
import ButtonWithNetworkSwitch from '../../Button/SwitchNetwork'
import Link from '../../Link/Link'
import AcceptAuctionModal from '../../Modal/AcceptAuction'
import Price from '../../Price/Price'

export type Props = {
  assetId: string
  chainId: number
  auction: {
    id: string
    reserveAmount: BigNumber
    currency: {
      decimals: number
      image: string
      symbol: string
    }
  }
  signer: Signer | undefined
  isOwner: boolean
  isHomepage: boolean
  inProgress: boolean
  endedWithNoBids: boolean
  endedWithNoReserve: boolean
  endedWithReserve: boolean
  blockExplorer: BlockExplorer
  onAuctionAccepted: (id: string) => Promise<void>
}

const SaleAuctionInfo: VFC<Props> = ({
  signer,
  assetId,
  chainId,
  auction,
  isOwner,
  isHomepage,
  inProgress,
  endedWithNoBids,
  endedWithNoReserve,
  endedWithReserve,
  blockExplorer,
  onAuctionAccepted,
}): ReactElement | null => {
  const { t } = useTranslation('components')
  const [_acceptAuction, { activeStep, transactionHash }] =
    useAcceptAuction(signer)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

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
    if (endedWithNoBids) {
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
    if (endedWithNoReserve) {
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
    if (endedWithReserve) {
      return {
        type: 'success',
        icon: <Icon as={BiBadgeCheck} h={6} w={6} color="white" />,
        title: t('sales.auction.info.with-reserve.title'),
        action: (
          <ButtonWithNetworkSwitch
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
          </ButtonWithNetworkSwitch>
        ),
      }
    }
  }, [
    inProgress,
    endedWithNoBids,
    endedWithNoReserve,
    endedWithReserve,
    auction,
    assetId,
    loading,
    acceptAuction,
    t,
    chainId,
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
