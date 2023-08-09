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
import Price from 'components/Price/Price'
import { convertDropActive } from 'convert'
import numbro from 'numbro'
import { useMemo } from 'react'
import { Timeline } from '../../hooks/useDropTimeline'
import { formatAddress } from '../../utils'
import Countdown from '../Countdown/Countdown'
import Image from '../Image/Image'
import Link from '../Link/Link'
import TokenMedia from '../Token/Media'

type Props = {
  drop: ReturnType<typeof convertDropActive>
  timeline: Timeline
}

export default function DropCard({ drop, timeline }: Props) {
  const timelineText = useMemo(() => {
    if (timeline === Timeline.UPCOMING) return 'Upcoming'
    if (timeline === Timeline.INPROGRESS) return 'In progress'
    return 'Ended'
  }, [timeline])

  return (
    <Box
      as={Link}
      href={`/collection/${drop.collection.chainId}/${drop.collection.address}/drop`}
      borderWidth={{ base: '0px', md: '1px' }}
      borderTopWidth="1px"
      borderBottomWidth="1px"
      borderColor="gray.200"
      borderRadius={{ base: 'none', md: '2xl' }}
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
          bg: 'rgba(0,0,0,0.8)',
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
        {timeline === Timeline.UPCOMING && (
          <Countdown date={drop.startDate} isStyled />
        )}
        <Text as="span" variant="caption" verticalAlign="middle" ml="auto">
          <Badge
            background="rgba(107, 114, 128, 0.5)"
            color="white"
            px={2}
            py={1}
            borderRadius="2xl"
          >
            {timelineText}
          </Badge>
        </Text>
      </Flex>

      <Box
        overflow="hidden"
        rounded="2xl"
        border="2px solid"
        borderColor="gray.200"
        position="relative"
        w={timeline === Timeline.ENDED ? 14 : '72px'}
        h={timeline === Timeline.ENDED ? 14 : '72px'}
        mt={timeline === Timeline.ENDED ? -3 : 14}
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
              By{' '}
              {drop.collection.deployer.name ||
                formatAddress(drop.collection.deployer.address, 10)}
            </Text>
            {drop.collection.deployer?.verified && (
              <Icon as={HiBadgeCheck} color="brand.500" h={4} w={4} />
            )}
          </Flex>

          <Flex alignItems="center" gap={2}>
            <Text variant="caption" color="white">
              {drop.supply === Infinity
                ? 'Open edition'
                : `${numbro(drop.supply).format({
                    thousandSeparated: true,
                  })} items`}
            </Text>
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
          colorScheme="whiteAlpha"
        />
      </Flex>
    </Box>
  )
}
