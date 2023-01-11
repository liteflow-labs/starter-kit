import {
  Flex,
  Heading,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { HiClock } from '@react-icons/all-files/hi/HiClock'
import { HiOutlineDotsHorizontal } from '@react-icons/all-files/hi/HiOutlineDotsHorizontal'
import Countdown from 'components/Countdown/Countdown'
import environment from 'environment'
import useTranslation from 'next-translate/useTranslation'
import { useMemo, useState, VFC } from 'react'
import Link from '../Link/Link'
import SaleAuctionCardFooter from '../Sales/Auction/CardFooter'
import SaleDirectCardFooter from '../Sales/Direct/CardFooter'
import SaleOpenCardFooter from '../Sales/Open/CardFooter'
import Avatar from '../User/Avatar'
import TokenMedia from './Media'

export type Props = {
  asset: {
    id: string
    name: string
    collection: {
      address: string
      name: string
    }
    image: string
    unlockedContent: { url: string; mimetype: string | null } | null
    animationUrl: string | null | undefined
    owned: BigNumber
  }
  creator: {
    address: string
    name: string | null | undefined
    image: string | null | undefined
    verified: boolean
  }
  auction:
    | {
        endAt: Date
      }
    | undefined
  sale:
    | {
        unitPrice: BigNumber
        currency: {
          decimals: number
          symbol: string
        }
      }
    | undefined
  numberOfSales: number
  displayCreator?: boolean
  hasMultiCurrency: boolean
}

const TokenCard: VFC<Props> = ({
  asset,
  creator,
  auction,
  sale,
  numberOfSales,
  displayCreator = false,
  hasMultiCurrency,
}) => {
  const { t } = useTranslation('templates')
  const href = asset.id ? `/tokens/${asset.id}` : '#'
  const isOwner = useMemo(() => asset.owned.gt('0'), [asset])
  const [isHovered, setIsHovered] = useState(false)
  const footer = useMemo(() => {
    if (auction)
      return (
        <SaleAuctionCardFooter
          href={href}
          isOwner={isOwner}
          showButton={isHovered}
        />
      )
    if (sale)
      return (
        <SaleDirectCardFooter
          href={href}
          unitPrice={sale.unitPrice}
          currency={sale.currency}
          numberOfSales={numberOfSales}
          hasMultiCurrency={hasMultiCurrency}
          isOwner={isOwner}
          showButton={isHovered}
        />
      )
    return (
      <SaleOpenCardFooter
        href={href}
        isOwner={isOwner}
        showButton={isHovered}
      />
    )
  }, [auction, href, isOwner, isHovered, sale, numberOfSales, hasMultiCurrency])

  // TODO: is the width correct?
  return (
    <Flex
      direction="column"
      h="min-content"
      maxW={72}
      align="stretch"
      overflow="hidden"
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.200"
      bgColor="white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Flex as={Link} href={href} h={72} w={72} position="relative">
        <TokenMedia
          image={asset.image}
          animationUrl={asset.animationUrl}
          unlockedContent={asset.unlockedContent}
          defaultText={asset.name}
          objectFit="cover"
          width={288}
          height={288}
          layout="fixed"
        />
        {auction && (
          <HStack
            position="absolute"
            left={4}
            right={4}
            bottom={4}
            bgColor="white"
            rounded="full"
            justify="center"
            spacing={1}
            px={4}
            py={0.5}
          >
            <Icon as={HiClock} h={5} w={5} color="gray.500" />
            <Text as="span" variant="subtitle2" color="gray.500">
              <Countdown date={auction.endAt} showSeconds={false} />
            </Text>
          </HStack>
        )}
      </Flex>
      <Flex justify="space-between" px={4} pt={4} pb={3} align="start">
        <Stack spacing={0} w="full">
          {displayCreator ? (
            <Avatar
              address={creator.address}
              image={creator.image}
              name={creator.name}
              verified={creator.verified}
              size={5}
            />
          ) : (
            <Link href={`/collection/${asset.collection.address}`}>
              <Text variant="subtitle2" color="gray.500" isTruncated>
                {asset.collection.name}
              </Text>
            </Link>
          )}
          <Link href={href}>
            <Heading
              as="h4"
              variant="heading2"
              color="brand.black"
              title={asset.name}
              isTruncated
            >
              {asset.name}
            </Heading>
          </Link>
        </Stack>
        <Menu>
          <MenuButton>
            <Icon as={HiOutlineDotsHorizontal} />
          </MenuButton>
          <MenuList>
            <Link
              href={`mailto:${environment.REPORT_EMAIL}?subject=${encodeURI(
                t('asset.detail.menu.report.subject'),
              )}&body=${encodeURI(t('asset.detail.menu.report.body', asset))}`}
              isExternal
            >
              <MenuItem>{t('asset.detail.menu.report.label')}</MenuItem>
            </Link>
          </MenuList>
        </Menu>
      </Flex>
      {footer && footer}
    </Flex>
  )
}

export default TokenCard
