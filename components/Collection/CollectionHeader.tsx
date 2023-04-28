import {
  Box,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react'
import { formatAddress } from '@nft/hooks'
import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord'
import { FaGlobe } from '@react-icons/all-files/fa/FaGlobe'
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import { HiOutlineDotsHorizontal } from '@react-icons/all-files/hi/HiOutlineDotsHorizontal'
import Etherscan from 'components/Icons/Etherscan'
import Image from 'components/Image/Image'
import Link from 'components/Link/Link'
import Truncate from 'components/Truncate/Truncate'
import useBlockExplorer from 'hooks/useBlockExplorer'
import useTranslation from 'next-translate/useTranslation'
import numbro from 'numbro'
import { FC, useMemo } from 'react'
import ChakraLink from '../../components/Link/Link'
import { chains } from '../../connectors'

type Props = {
  collection: {
    address: string
    chainId: number
    name: string
    description: string | null
    image: string | null
    cover: string | null
    twitter: string | null
    discord: string | null
    website: string | null
    deployerAddress: string
    deployer: {
      address: string
      name: string | null
      username: string | null
      verified: boolean
    } | null
    totalVolume: string
    totalVolumeCurrencySymbol: string
    floorPrice: string | null
    floorPriceCurrencySymbol: string | null
    totalOwners: number
    supply: number
  }
  baseURL: string
  reportEmail: string
}

const CollectionHeader: FC<Props> = ({ collection, reportEmail }) => {
  const { t } = useTranslation('templates')
  const blockExplorer = useBlockExplorer(collection.chainId)
  const chain = useMemo(
    () => chains.find((x) => x.id === collection.chainId),
    [collection.chainId],
  )

  const blocks = useMemo(
    () => [
      {
        name: t('collection.header.data-labels.total-volume'),
        value:
          numbro(collection.totalVolume).format({
            thousandSeparated: true,
            trimMantissa: true,
            mantissa: 4,
          }) +
          ' ' +
          collection.totalVolumeCurrencySymbol,
        title: `${collection.totalVolume} ${collection.totalVolumeCurrencySymbol}`,
      },
      {
        name: t('collection.header.data-labels.floor-price'),
        value: collection.floorPrice
          ? numbro(collection.floorPrice).format({
              thousandSeparated: true,
              trimMantissa: true,
              mantissa: 4,
            }) +
            ' ' +
            collection.floorPriceCurrencySymbol
          : '-',
        title: `${collection.floorPrice || '-'} ${
          collection.floorPriceCurrencySymbol
        }`,
      },
      {
        name: t('collection.header.data-labels.owners'),
        value: numbro(collection.totalOwners).format({
          thousandSeparated: true,
        }),
        title: collection.totalOwners.toString(),
      },
      {
        name: t('collection.header.data-labels.items'),
        value: numbro(collection.supply).format({ thousandSeparated: true }),
        title: collection.supply.toString(),
      },
      {
        type: 'separator',
      },
      {
        name: t('collection.header.data-labels.chain'),
        value: chain?.name,
        title: chain?.name,
      },
    ],
    [
      collection.floorPrice,
      collection.floorPriceCurrencySymbol,
      collection.supply,
      collection.totalOwners,
      collection.totalVolume,
      collection.totalVolumeCurrencySymbol,
      chain,
      t,
    ],
  )

  return (
    <>
      <Flex
        position="relative"
        h={200}
        w="full"
        rounded={{ base: 'none', sm: '2xl' }}
        bg="gray.200"
      >
        {collection.cover && (
          <Image
            src={collection.cover}
            alt={collection.name}
            layout="fill"
            objectFit="cover"
            borderRadius={{ base: 0, sm: '2xl' }}
            sizes="
            (min-width: 80em) 1216px,
            100vw"
          />
        )}
        <Box
          position="absolute"
          bottom="-64px"
          left={4}
          w={32}
          h={32}
          rounded="2xl"
          overflow="hidden"
          border="2px solid"
          borderColor="white"
          bg="gray.200"
        >
          {collection.image && (
            <Image
              src={collection.image}
              alt={collection.name}
              width={128}
              height={128}
              objectFit="cover"
            />
          )}
        </Box>
      </Flex>
      <Flex pt={24} align="flex-start" justify="space-between" gap={4}>
        <Box>
          <Heading variant="title" pb={1}>
            {collection.name}
          </Heading>
          <Heading color="gray.500" variant="heading1">
            {t('collection.header.by')}{' '}
            <Text
              as={Link}
              href={`/users/${collection.deployerAddress}`}
              color="brand.black"
            >
              <Text as="span" color="">
                {collection.deployer?.name ||
                  formatAddress(collection.deployerAddress, 10)}
              </Text>
              {collection.deployer?.verified && (
                <Icon as={HiBadgeCheck} color="brand.500" boxSize={5} />
              )}
            </Text>
          </Heading>
        </Box>
        <Flex justify="flex-end">
          <Flex gap={4}>
            <IconButton
              as={Link}
              aria-label={`Visit ${blockExplorer.name}`}
              icon={<Etherscan boxSize={5} />}
              rounded="full"
              variant="outline"
              colorScheme="gray"
              href={blockExplorer.address(collection.address)}
              isExternal
            />
            {collection.website && (
              <IconButton
                as={Link}
                aria-label="Visit Website"
                icon={<FaGlobe />}
                rounded="full"
                variant="outline"
                colorScheme="gray"
                href={collection.website}
                isExternal
              />
            )}
            {collection.discord && (
              <IconButton
                as={Link}
                aria-label="Visit Discord"
                icon={<FaDiscord />}
                rounded="full"
                variant="outline"
                colorScheme="gray"
                href={collection.discord}
                isExternal
              />
            )}
            {collection.twitter && (
              <IconButton
                as={Link}
                aria-label="Visit Twitter"
                icon={<FaTwitter />}
                rounded="full"
                variant="outline"
                colorScheme="gray"
                href={collection.twitter}
                isExternal
              />
            )}
          </Flex>
          <Divider orientation="vertical" h="40px" mx={4} />
          <Menu autoSelect={false}>
            <MenuButton
              as={IconButton}
              variant="outline"
              colorScheme="gray"
              rounded="full"
              aria-label="activator"
              icon={<Icon as={HiOutlineDotsHorizontal} w={5} h={5} />}
            />
            <MenuList>
              <ChakraLink
                href={`mailto:${reportEmail}?subject=${encodeURI(
                  'Report a collection',
                )}&body=${encodeURI(
                  `I would like to report the following collection "${collection.name}" (#${collection.address})\nReason: `,
                )}`}
                isExternal
              >
                <MenuItem>{t('collection.header.menu.report')}</MenuItem>
              </ChakraLink>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
      {collection.description && (
        <Box mt={4}>
          <Truncate size="lg" color="gray.500" length={200}>
            {collection.description}
          </Truncate>
        </Box>
      )}
      <HStack spacing={8} mt={4} flexWrap="wrap">
        {blocks.map((block, i) =>
          block.type === 'separator' ? (
            <Divider orientation="vertical" height="40px" key={i} />
          ) : (
            <Flex key={i} flexDirection="column" justifyContent="center" py={2}>
              <Text
                variant="button1"
                title={block.title}
                color="brand.black"
                isTruncated
              >
                {block.value}
              </Text>
              <Text
                variant="subtitle2"
                title={block.name}
                isTruncated
                color="gray.500"
              >
                {block.name}
              </Text>
            </Flex>
          ),
        )}
      </HStack>
    </>
  )
}

export default CollectionHeader
