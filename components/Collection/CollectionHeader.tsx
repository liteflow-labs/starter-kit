import {
  Box,
  Divider,
  Flex,
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import { formatAddress } from '@nft/hooks'
import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord'
import { FaEllipsisH } from '@react-icons/all-files/fa/FaEllipsisH'
import { FaGlobe } from '@react-icons/all-files/fa/FaGlobe'
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import Etherscan from 'components/Icons/Etherscan'
import Image from 'components/Image/Image'
import Link from 'components/Link/Link'
import Truncate from 'components/Truncate/Truncate'
import numbro from 'numbro'
import { FC, useMemo } from 'react'

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
    floorPrice: string
    floorPriceCurrencySymbol: string
    totalOwners: number
    supply: number
  }
  baseURL: string
  reportEmail: string
  explorer: {
    name: string
    url: string
  }
}

const CollectionHeader: FC<Props> = ({ collection, explorer, reportEmail }) => {
  const getDeployerNamer = (collection: Props['collection']) => {
    if (!collection.deployer)
      return formatAddress(collection.deployerAddress, 10)
    return (
      collection.deployer?.name ||
      formatAddress(collection.deployer.address, 10)
    )
  }
  const deployerHref = `/users${
    collection.deployer?.username || collection.deployerAddress
  }`

  const blocks = useMemo(
    () => [
      {
        name: 'Total vol.',
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
        name: 'Floor price',
        value:
          numbro(collection.floorPrice).format({
            thousandSeparated: true,
            trimMantissa: true,
            mantissa: 4,
          }) +
          ' ' +
          collection.floorPriceCurrencySymbol,
        title: `${collection.floorPrice} ${collection.floorPriceCurrencySymbol}`,
      },
      {
        name: 'Owners',
        value: numbro(collection.totalOwners).format({
          thousandSeparated: true,
        }),
        title: collection.totalOwners.toString(),
      },
      {
        name: 'Items',
        value: numbro(collection.supply).format({ thousandSeparated: true }),
        title: collection.supply.toString(),
      },
    ],
    [
      collection.floorPrice,
      collection.floorPriceCurrencySymbol,
      collection.supply,
      collection.totalOwners,
      collection.totalVolume,
      collection.totalVolumeCurrencySymbol,
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
              layout="fill"
              objectFit="cover"
            />
          )}
        </Box>
      </Flex>
      <Flex pt={24} align="flex-start" justify="space-between" gap={4}>
        <Box>
          <Heading variant="title">{collection.name}</Heading>
          <Heading
            as={Link}
            href={deployerHref}
            variant="heading1"
            color="gray.500"
          >
            By{' '}
            <Text as="span" color="">
              {getDeployerNamer(collection)}
            </Text>
            {collection.deployer?.verified && (
              <Icon as={HiBadgeCheck} color="brand.500" boxSize={5} />
            )}
          </Heading>
          {collection.description && (
            <Box mt={4}>
              <Truncate size="lg" color="gray.500" length={200}>
                {collection.description}
              </Truncate>
            </Box>
          )}
          <SimpleGrid
            columns={{ base: 2, lg: 4 }}
            spacing={8}
            mt={4}
            w="max-content"
          >
            {blocks.map((block) => (
              <Flex
                key={block.name}
                flexDirection="column"
                justifyContent="center"
                py={2}
              >
                <Text
                  variant="button1"
                  color="brand.black"
                  title={block.name}
                  isTruncated
                >
                  {block.name}
                </Text>
                <Text
                  variant="subtitle2"
                  title={block.title}
                  isTruncated
                  color="gray.500"
                >
                  {block.value}
                </Text>
              </Flex>
            ))}
          </SimpleGrid>
        </Box>
        <Flex minW="280px" justify="flex-end">
          <Flex gap={4}>
            <IconButton
              as={Link}
              aria-label={`Visit ${explorer.name}`}
              icon={<Etherscan boxSize={5} />}
              rounded="full"
              variant="outline"
              borderColor="gray.200"
              color="brand.black"
              href={explorer.url + '/address/' + collection.address}
              isExternal
            />
            {collection.website && (
              <IconButton
                as={Link}
                aria-label="Visit Website"
                icon={<FaGlobe />}
                rounded="full"
                variant="outline"
                borderColor="gray.200"
                color="brand.black"
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
                borderColor="gray.200"
                color="brand.black"
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
                borderColor="gray.200"
                color="brand.black"
                href={collection.twitter}
                isExternal
              />
            )}
          </Flex>
          <Divider orientation="vertical" h="40px" mx={4} />
          <Menu placement="bottom-end" autoSelect={false}>
            <MenuButton
              as={IconButton}
              aria-label="options"
              rounded="full"
              variant="outline"
              borderColor="gray.200"
              color="brand.black"
              icon={<FaEllipsisH />}
            />
            <MenuList>
              <MenuItem
                as={Link}
                href={`mailto:${reportEmail}?subject=${encodeURI(
                  'Report a collection',
                )}&body=${encodeURI(
                  `I would like to report the following collection "${collection.name}" (#${collection.address})\nReason: `,
                )}`}
                isExternal
              >
                Report
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </>
  )
}

export default CollectionHeader
