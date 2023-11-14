import {
  Badge,
  Box,
  Divider,
  Flex,
  Heading,
  Icon,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import numbro from 'numbro'
import { useMemo } from 'react'
import { AccountVerificationStatus } from '../../graphql'
import useTimeStatus, { Status } from '../../hooks/useTimeStatus'
import { formatAddress } from '../../utils'
import DropCountdown from '../Countdown/DropCountdown'
import Image from '../Image/Image'
import Link from '../Link/Link'
import Price from '../Price/Price'

type Props = {
  collection: {
    address: string
    chainId: number
    cover: string | null
    image: string | null
    name: string
    deployer: {
      address: string
      name: string | null
      verification: {
        status: AccountVerificationStatus
      } | null
    }
  }
  drop: {
    startDate: Date
    endDate: Date
    unitPrice: string
    currency: {
      decimals: number
      symbol: string
      image: string
    }
  }
  totalSupply: BigNumber | null
  onCountdownEnd?: () => void
}

export default function DropCard({
  collection,
  drop,
  totalSupply,
  onCountdownEnd,
}: Props) {
  const { t } = useTranslation('components')
  const status = useTimeStatus(drop)

  const statusText = useMemo(() => {
    if (status === Status.UPCOMING) return t('drop.timeline.upcoming')
    if (status === Status.INPROGRESS) return t('drop.timeline.in-progress')
    return t('drop.timeline.ended')
  }, [t, status])

  return (
    <Box
      as={Link}
      href={`/collection/${collection.chainId}/${collection.address}/drop`}
      borderWidth="1px"
      borderRadius="2xl"
      w="full"
      overflow="hidden"
      position="relative"
      p={4}
    >
      <Box
        position="absolute"
        inset={0}
        _after={{
          content: '""',
          position: 'absolute',
          inset: 0,
          bg: 'rgba(0,0,0,0.7)',
        }}
        bg="gray.100"
      >
        {collection.cover && (
          <Image
            src={collection.cover}
            alt={collection.name}
            fill
            sizes="(min-width: 62em) 600px, 100vw"
            objectFit="cover"
          />
        )}
      </Box>

      <Flex position="relative" w="full">
        {status === Status.INPROGRESS && (
          // Hidden countdown to trigger refetch when countdown ends
          <DropCountdown
            date={new Date(drop.endDate)}
            isHidden
            onCountdownEnd={onCountdownEnd}
          />
        )}
        {status === Status.UPCOMING && (
          <DropCountdown
            date={new Date(drop.startDate)}
            onCountdownEnd={onCountdownEnd}
          />
        )}
        <Text as="span" variant="caption" verticalAlign="middle" ml="auto">
          <Badge
            background="rgba(107, 114, 128, 0.5)"
            color="white"
            px={2}
            py={1}
            borderRadius="2xl"
          >
            {statusText}
          </Badge>
        </Text>
      </Flex>

      <Box
        overflow="hidden"
        rounded="2xl"
        borderWidth="2px"
        position="relative"
        w={status === Status.ENDED ? 14 : '72px'}
        h={status === Status.ENDED ? 14 : '72px'}
        mt={status === Status.ENDED ? -3 : 14}
        mb={4}
        bg="gray.200"
      >
        {collection.image && (
          <Image
            src={collection.image}
            alt={collection.name}
            fill
            sizes="72px"
            objectFit="cover"
          />
        )}
      </Box>

      <Flex position="relative" justifyContent="space-between" gap={4} w="full">
        <Flex flexDir="column" gap={1}>
          <Heading variant="heading2" color="white" isTruncated>
            {collection.name}
          </Heading>

          <Flex alignItems="center" gap={1.5}>
            <Text variant="button2" color="white">
              {t('drop.by', {
                address:
                  collection.deployer.name ||
                  formatAddress(collection.deployer.address, 10),
              })}
            </Text>
            {collection.deployer.verification?.status === 'VALIDATED' && (
              <Icon as={HiBadgeCheck} color="brand.500" h={4} w={4} />
            )}
          </Flex>

          <Flex alignItems="center" gap={2}>
            {totalSupply ? (
              <Text variant="caption" color="white">
                <Trans
                  ns="components"
                  i18nKey="drop.supply.available"
                  values={{
                    count: totalSupply.toNumber(),
                  }}
                  components={[
                    <>
                      {numbro(totalSupply).format({
                        thousandSeparated: true,
                      })}
                    </>,
                  ]}
                />
              </Text>
            ) : (
              <Text variant="caption" color="white">
                {t('drop.supply.infinite')}
              </Text>
            )}
            <Divider orientation="vertical" h={4} />
            <Stack alignItems="center" direction="row" spacing={1}>
              <Flex flexShrink={0}>
                <Image
                  src={drop.currency.image}
                  alt={drop.currency.symbol}
                  width={16}
                  height={16}
                  w={4}
                  h={4}
                />
              </Flex>
              <Text variant="caption" color="white" isTruncated>
                <Price amount={drop.unitPrice} currency={drop.currency} />
              </Text>
            </Stack>
          </Flex>
        </Flex>
        <IconButton
          variant="outline"
          aria-label="Drop detail"
          icon={<Icon as={HiArrowNarrowRight} boxSize={4} />}
          placeSelf="flex-end"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
        />
      </Flex>
    </Box>
  )
}
