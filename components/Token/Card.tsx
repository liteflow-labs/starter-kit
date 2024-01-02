import {
  AspectRatio,
  Badge,
  Box,
  Flex,
  Heading,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { HiOutlineDotsHorizontal } from '@react-icons/all-files/hi/HiOutlineDotsHorizontal'
import useTranslation from 'next-translate/useTranslation'
import numbro from 'numbro'
import { FC, useMemo, useState } from 'react'
import { AccountVerificationStatus, Standard } from '../../graphql'
import useDetectAssetMedia from '../../hooks/useDetectAssetMedia'
import useEnvironment from '../../hooks/useEnvironment'
import Image from '../Image/Image'
import Link from '../Link/Link'
import SaleDirectCardFooter from '../Sales/Direct/CardFooter'
import SaleOpenCardFooter from '../Sales/Open/CardFooter'
import TokenMedia from './Media'

export type Props = {
  asset: {
    id: string
    name: string
    collection: {
      address: string
      name: string
      chainId: number
      standard: Standard
    }
    image: string
    imageMimetype: string | null
    animationUrl?: string | null
    animationMimetype?: string | null
    creator: {
      address: string
      name: string | null
      image: string | null
      verification: {
        status: AccountVerificationStatus
      } | null
    }
    owned: {
      quantity: string
    } | null
    quantity: string
    bestBid: {
      nodes: {
        unitPrice: string
        currency: {
          decimals: number
          symbol: string
        }
      }[]
    }
    firstSale:
      | {
          totalCount: number
          totalCurrencyDistinctCount: number
          nodes: {
            id: string
            unitPrice: string
            currency: {
              decimals: number
              symbol: string
            }
          }[]
        }
      | undefined
  }
}

const TokenCard: FC<Props> = ({ asset }) => {
  const { CHAINS, REPORT_EMAIL } = useEnvironment()
  const { t } = useTranslation('templates')
  const isOwner = useMemo(
    () => BigNumber.from(asset.owned?.quantity || 0).gt('0'),
    [asset],
  )
  const [isHovered, setIsHovered] = useState(false)
  const media = useDetectAssetMedia(asset)

  const sale = asset.firstSale?.nodes[0]
  const bestBid =
    asset.bestBid?.nodes?.length > 0 ? asset.bestBid.nodes[0] : undefined
  const numberOfSales = asset.firstSale?.totalCount || 0
  const hasMultiCurrency = asset.firstSale?.totalCurrencyDistinctCount
    ? asset.firstSale.totalCurrencyDistinctCount > 1
    : false
  const chainName = useMemo(
    () => CHAINS.find((x) => x.id === asset.collection.chainId)?.name,
    [asset.collection.chainId, CHAINS],
  )

  const footer = useMemo(() => {
    if (sale)
      return (
        <SaleDirectCardFooter
          sale={sale}
          numberOfSales={numberOfSales}
          hasMultiCurrency={hasMultiCurrency}
          isOwner={isOwner}
          showButton={isHovered}
        />
      )
    return (
      <SaleOpenCardFooter
        assetId={asset.id}
        bestBid={bestBid}
        isOwner={isOwner}
        showButton={isHovered}
      />
    )
  }, [
    asset.id,
    bestBid,
    hasMultiCurrency,
    isHovered,
    isOwner,
    numberOfSales,
    sale,
  ])

  return (
    <Flex
      direction="column"
      w="full"
      align="stretch"
      overflow="hidden"
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.200"
      shadow="sm"
      bgColor="white"
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Flex
        as={Link}
        href={`/tokens/${asset.id}`}
        w="full"
        position="relative"
        bg="gray.100"
      >
        <AspectRatio w="full" ratio={1}>
          {media.media?.url ? (
            <TokenMedia
              {...media}
              defaultText={asset.name}
              fill
              sizes="
            (min-width: 80em) 292px,
            (min-width: 62em) 25vw,
            (min-width: 48em) 33vw,
            (min-width: 30em) 50vw,
            100vw"
            />
          ) : (
            <Box />
          )}
        </AspectRatio>
      </Flex>
      {isHovered && (
        <>
          <Flex
            rounded="full"
            position="absolute"
            top={4}
            left={4}
            title={chainName}
            cursor="pointer"
            overflow="hidden"
            filter="grayscale(100%)"
          >
            <Image
              src={`/chains/${asset.collection.chainId}.svg`}
              alt={asset.collection.chainId.toString()}
              width={24}
              height={24}
              w={6}
              h={6}
            />
          </Flex>
          {asset.collection.standard === 'ERC1155' && (
            <Badge
              position="absolute"
              top={4}
              right={4}
              px={2}
              py={0.5}
              borderRadius="2xl"
              textTransform="capitalize"
              pointerEvents="none"
              bg="white"
              color="gray.500"
            >
              {t('asset.detail.supply', {
                supply: numbro(asset.quantity).format({
                  average: true,
                  mantissa: 2,
                  trimMantissa: true,
                  roundingFunction: (num) => num,
                }),
              })}
            </Badge>
          )}
        </>
      )}
      <Flex justify="space-between" px={4} pt={4} pb={3} gap={2} align="start">
        <Stack spacing={0} w="full" overflow="hidden">
          <Link
            href={`/collection/${asset.collection.chainId}/${asset.collection.address}`}
          >
            <Text variant="subtitle2" color="gray.500" isTruncated>
              {asset.collection.name}
            </Text>
          </Link>
          <Link href={`/tokens/${asset.id}`}>
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
        <Box display={isHovered ? 'block' : 'none'}>
          <Menu>
            <MenuButton>
              <Icon as={HiOutlineDotsHorizontal} />
            </MenuButton>
            <MenuList>
              <Link
                href={`mailto:${REPORT_EMAIL}?subject=${encodeURI(
                  t('asset.detail.menu.report.subject'),
                )}&body=${encodeURI(
                  t('asset.detail.menu.report.body', asset),
                )}`}
                isExternal
              >
                <MenuItem>{t('asset.detail.menu.report.label')}</MenuItem>
              </Link>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
      {footer && footer}
    </Flex>
  )
}

export default TokenCard
