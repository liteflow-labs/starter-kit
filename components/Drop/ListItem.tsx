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
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import numbro from 'numbro'
import { FC, useMemo } from 'react'
import Price from '../../components/Price/Price'
import useDropStatus, { Status } from '../../hooks/useTimeStatus'
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
  const { t } = useTranslation('components')
  const state = useDropStatus(drop)

  const stateText = useMemo(() => {
    if (state === Status.UPCOMING) return t('drop.timeline.upcoming')
    if (state === Status.INPROGRESS) return t('drop.timeline.in-progress')
    return t('drop.timeline.ended')
  }, [t, state])

  return (
    <Accordion
      allowMultiple
      defaultIndex={isOpen ? [0] : undefined}
      width="full"
      borderWidth="1px"
      borderRadius="2xl"
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
                  bg="brand.50"
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
                  <Text variant="text-sm" color="gray.500">
                    <Trans
                      ns="components"
                      i18nKey="drop.listItem.price"
                      components={[
                        <Price
                          amount={drop.unitPrice}
                          currency={drop.currency}
                          key="price"
                        />,
                      ]}
                    />
                  </Text>
                  <Text variant="text-sm" color="gray.500">
                    {t('drop.listItem.startDate', {
                      startDate: formatDate(drop.startDate),
                    })}
                  </Text>
                  {isExpanded && (
                    <>
                      <Text variant="text-sm" color="gray.500">
                        {t('drop.listItem.endDate', {
                          endDate: formatDate(drop.endDate),
                        })}
                      </Text>
                      {drop.supply && (
                        <Text variant="text-sm" color="gray.500">
                          {t('drop.listItem.supply', {
                            supply: numbro(drop.supply).format({
                              thousandSeparated: true,
                            }),
                          })}
                        </Text>
                      )}
                      {drop.maxQuantityPerWallet && (
                        <Text variant="text-sm" color="gray.500">
                          {t('drop.listItem.maxQuantityPerWallet', {
                            maxQuantityPerWallet: numbro(
                              drop.maxQuantityPerWallet,
                            ).format({
                              thousandSeparated: true,
                            }),
                          })}
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
                    colorScheme={drop.isAllowed ? 'green' : 'gray'}
                    px={2}
                    py={1}
                    borderRadius="2xl"
                    textTransform="none"
                  >
                    {drop.isAllowed
                      ? t('drop.listItem.eligible')
                      : t('drop.listItem.notEligible')}
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
                    {stateText}
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
