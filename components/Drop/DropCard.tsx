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
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import { convertDropActive } from 'convert'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import numbro from 'numbro'
import { useMemo } from 'react'
import useTimeStatus, { Status } from '../../hooks/useTimeStatus'
import { formatAddress } from '../../utils'
import DropCountdown from '../Countdown/DropCountdown'
import Image from '../Image/Image'
import Link from '../Link/Link'
import Price from '../Price/Price'
import TokenMedia from '../Token/Media'

type Props = {
  drop: ReturnType<typeof convertDropActive>
  onCountdownEnd?: () => void
}

export default function DropCard({ drop, onCountdownEnd }: Props) {
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
      href={`/collection/${drop.collection.chainId}/${drop.collection.address}/drop`}
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
        {drop.collection.cover && (
          <TokenMedia
            imageUrl={drop.collection.cover}
            defaultText={drop.collection.name}
            animationUrl={undefined}
            unlockedContent={null}
            sizes="(min-width: 62em) 600px, 100vw"
            fill
          />
        )}
      </Box>

      <Flex position="relative" w="full">
        {status === Status.INPROGRESS && (
          // Hidden countdown to trigger refetch when countdown ends
          <DropCountdown
            date={drop.endDate}
            isHidden
            onCountdownEnd={onCountdownEnd}
          />
        )}
        {status === Status.UPCOMING && (
          <DropCountdown
            date={drop.startDate}
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
        {drop.collection.image && (
          <Image
            src={drop.collection.image}
            alt={drop.collection.name}
            fill
            sizes="72px"
            objectFit="cover"
          />
        )}
      </Box>

      <Flex position="relative" justifyContent="space-between" gap={4} w="full">
        <Flex flexDir="column" gap={1}>
          <Heading variant="heading2" color="white" isTruncated>
            {drop.collection.name}
          </Heading>

          <Flex alignItems="center" gap={1.5}>
            <Text variant="button2" color="white">
              {t('drop.by', {
                address:
                  drop.collection.deployer.name ||
                  formatAddress(drop.collection.deployer.address, 10),
              })}
            </Text>
            {drop.collection.deployer?.verified && (
              <Icon as={HiBadgeCheck} color="brand.500" h={4} w={4} />
            )}
          </Flex>

          <Flex alignItems="center" gap={2}>
            {drop.supply ? (
              <Text variant="caption" color="white">
                <Trans
                  ns="components"
                  i18nKey="drop.supply.available"
                  values={{
                    count: drop.supply.toNumber(),
                  }}
                  components={[
                    <>
                      {numbro(drop.supply).format({
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
