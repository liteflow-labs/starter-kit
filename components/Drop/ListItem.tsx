import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  Badge,
  Center,
  Flex,
  Text,
} from '@chakra-ui/react'
import dayjs from 'dayjs'
import numbro from 'numbro'
import { FC, useMemo } from 'react'
import Price from '../../components/Price/Price'
import useDropTimeline, { Timeline } from '../../hooks/useDropTimeline'
import useNow from '../../hooks/useNow'
import { formatDate } from '../../utils'

type Props = {
  drop: {
    id: string
    name: string
    startDate: Date
    endDate: Date
    unitPrice: string
    isAllowed: boolean
    currency: {
      id: string
      decimals: number
      symbol: string
      image: string
    }
    supply: string | null
    maxQuantityPerWallet: string | null
  }
  isOpen: boolean
}

const DropListItem: FC<Props> = ({ drop, isOpen }) => {
  const now = useNow()
  const timeline = useDropTimeline({ now, drop })

  const timelineText = useMemo(() => {
    if (timeline === Timeline.UPCOMING) return 'Upcoming'
    if (timeline === Timeline.INPROGRESS) return 'In progress'
    return 'Ended'
  }, [timeline])

  return (
    <Accordion
      allowMultiple
      defaultIndex={isOpen ? [0] : undefined}
      width="full"
      borderWidth={{ base: '0px', sm: '1px' }}
      borderTopWidth="1px"
      borderBottomWidth="1px"
      borderColor="grayAlpha.700"
      borderRadius={{ base: 'none', sm: '2xl' }}
    >
      <AccordionItem p={0} border="none">
        {({ isExpanded }) => (
          <AccordionButton _focus={{ boxShadow: 'none' }} p={4}>
            <Flex
              flexDirection={{ base: 'column', md: 'row' }}
              width="full"
              overflow="hidden"
              gap={4}
            >
              <Flex order={{ base: 2, md: 1 }} gap={4} flex={1}>
                <Center
                  flexDirection="column"
                  width={10}
                  h={10}
                  bg="grayAlpha.800"
                  rounded="lg"
                  flexShrink={0}
                >
                  <Text variant="subtitle2">
                    {dayjs(drop.startDate).format('DD')}
                  </Text>
                  <Text variant="caption">
                    {dayjs(drop.startDate).format('MMM')}
                  </Text>
                </Center>
                <Flex alignItems="flex-start" flexDirection="column" flex={1}>
                  <Text
                    variant="subtitle2"
                    title={drop.name}
                    textAlign="start"
                    noOfLines={1}
                  >
                    {drop.name}
                  </Text>
                  <Text variant="body2" color="grayAlpha.500">
                    Price:{' '}
                    <Price amount={drop.unitPrice} currency={drop.currency} />
                  </Text>
                  <Text variant="body2" color="grayAlpha.500">
                    Starts: {formatDate(drop.startDate)}
                  </Text>
                  {isExpanded && (
                    <>
                      <Text variant="body2" color="grayAlpha.500">
                        Ends: {formatDate(drop.endDate)}
                      </Text>
                      {drop.supply && (
                        <Text variant="body2" color="grayAlpha.500">
                          Supply:{' '}
                          {numbro(drop.supply).format({
                            thousandSeparated: true,
                          })}
                        </Text>
                      )}
                      {drop.maxQuantityPerWallet && (
                        <Text variant="body2" color="grayAlpha.500">
                          Mint limit:{' '}
                          {numbro(drop.maxQuantityPerWallet).format({
                            thousandSeparated: true,
                          })}{' '}
                          per wallet
                        </Text>
                      )}
                    </>
                  )}
                </Flex>
              </Flex>
              <Flex order={{ base: 1, md: 2 }} gap={4} flexShrink={0}>
                <Text as="span" variant="caption">
                  <Badge
                    variant="outline"
                    colorScheme={drop.isAllowed ? 'green' : 'grayAlpha'}
                    px={2}
                    py={1}
                    borderRadius="2xl"
                    textTransform="none"
                  >
                    {drop.isAllowed ? 'Eligible' : 'Not eligible'}
                  </Badge>
                </Text>
                <Text as="span" variant="caption" ml={{ base: 'auto', sm: 0 }}>
                  <Badge
                    background="rgba(107, 114, 128, 0.5)"
                    color="white"
                    px={2}
                    py={1}
                    borderRadius="2xl"
                    textTransform="none"
                  >
                    {timelineText}
                  </Badge>
                </Text>
                <AccordionIcon boxSize={6} />
              </Flex>
            </Flex>
          </AccordionButton>
        )}
      </AccordionItem>
    </Accordion>
  )
}

export default DropListItem
