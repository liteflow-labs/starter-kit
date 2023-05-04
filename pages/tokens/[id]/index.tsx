import {
  AspectRatio,
  Box,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Tab,
  TabList,
  Tabs,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatError } from '@nft/hooks'
import { FaInfoCircle } from '@react-icons/all-files/fa/FaInfoCircle'
import { HiOutlineDotsHorizontal } from '@react-icons/all-files/hi/HiOutlineDotsHorizontal'
import linkify from 'components/Linkify/Linkify'
import useRefreshAsset from 'hooks/useRefreshAsset'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Error from 'next/error'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import invariant from 'ts-invariant'
import BidList from '../../../components/Bid/BidList'
import Head from '../../../components/Head'
import HistoryList from '../../../components/History/HistoryList'
import Image from '../../../components/Image/Image'
import Link from '../../../components/Link/Link'
import SaleDetail from '../../../components/Sales/Detail'
import SkeletonProperty from '../../../components/Skeleton/Property'
import TokenMedia from '../../../components/Token/Media'
import TokenMetadata from '../../../components/Token/Metadata'
import TraitList from '../../../components/Trait/TraitList'
import { chains } from '../../../connectors'
import {
  convertAuctionFull,
  convertBidFull,
  convertOwnership,
  convertSaleFull,
  convertTraits,
  convertUser,
} from '../../../convert'
import environment from '../../../environment'
import { useFetchAssetQuery } from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useChainCurrencies from '../../../hooks/useChainCurrencies'
import useEagerConnect from '../../../hooks/useEagerConnect'
import useNow from '../../../hooks/useNow'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import useSigner from '../../../hooks/useSigner'
import LargeLayout from '../../../layouts/large'

type Props = {
  now: string
}

enum AssetTabs {
  bids = 'bids',
  history = 'history',
}

const tabs = [AssetTabs.bids, AssetTabs.history]

const DetailPage: NextPage<Props> = ({ now: nowProp }) => {
  useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const toast = useToast()
  const { address } = useAccount()
  const { query, replace } = useRouter()
  const [showPreview, setShowPreview] = useState(false)
  const assetId = useRequiredQueryParamSingle('id')
  const [_chainId, collectionAddress, tokenId] = assetId.split('-')
  invariant(_chainId, 'chainId is required')
  invariant(collectionAddress, 'collectionAddress is required')
  invariant(tokenId, 'tokenId is required')
  const chainId = parseInt(_chainId, 10)

  const date = useMemo(() => new Date(nowProp), [nowProp])
  const { data, refetch, loading, previousData } = useFetchAssetQuery({
    variables: {
      id: assetId,
      now: date,
      address: address || '',
    },
  })
  const chainCurrency = useChainCurrencies(chainId, { onlyERC20: true })

  const asset = useMemo(
    () => data?.asset || previousData?.asset,
    [data, previousData],
  )

  const blockExplorer = useBlockExplorer(chainId)

  const totalOwned = useMemo(
    () => BigNumber.from(asset?.owned?.quantity || 0),
    [asset],
  )

  const isOwner = useMemo(() => totalOwned.gt('0'), [totalOwned])
  const ownAllSupply = useMemo(
    () => totalOwned.gte(BigNumber.from(asset?.quantity || '0')),
    [asset, totalOwned],
  )
  const isSingle = useMemo(
    () => asset?.collection.standard === 'ERC721',
    [asset],
  )
  const chain = useMemo(() => chains.find((x) => x.id === chainId), [chainId])

  const traits = useMemo(
    () =>
      asset &&
      asset.traits.nodes.length > 0 &&
      asset.collection.traits &&
      convertTraits(asset),
    [asset],
  )

  const tabIndex = useMemo(
    () => (query.filter ? tabs.findIndex((tab) => tab === query.filter) : 0),
    [query.filter],
  )

  const assetExternalURL = useMemo(
    () => blockExplorer.token(collectionAddress, tokenId),
    [blockExplorer, collectionAddress, tokenId],
  )

  const now = useNow()
  const auction = useMemo(() => {
    const first = asset?.auctions.nodes[0]
    if (!first) return
    const auction = convertAuctionFull(first)
    if (!auction) return
    // check if auction is expired
    if (new Date(auction.expireAt) <= now) return
    // check if auction has a winning offer
    if (!!auction.winningOffer?.id) return
    return auction
  }, [asset, now])

  const directSales = useMemo(
    () => asset?.sales.nodes.map(convertSaleFull) || [],
    [asset],
  )

  const bestBid = useMemo(
    () => asset?.auctions.nodes[0]?.offers.nodes.map(convertBidFull)[0],
    [asset],
  )

  const creator = useMemo(
    () =>
      asset ? convertUser(asset.creator, asset.creator.address) : undefined,
    [asset],
  )

  const owners = useMemo(
    () => asset?.ownerships.nodes.map(convertOwnership) || [],
    [asset],
  )

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const refreshAsset = useRefreshAsset()
  const refreshMetadata = useCallback(
    async (assetId: string) => {
      try {
        await refreshAsset(assetId)
        await refetch()
        toast({
          title: 'Successfully refreshed metadata',
          status: 'success',
        })
      } catch (e) {
        toast({
          title: formatError(e),
          status: 'error',
        })
      }
    },
    [refetch, refreshAsset, toast],
  )

  if (!loading && !asset) return <Error statusCode={404} />
  return (
    <LargeLayout>
      <Head
        title={asset?.name || ''}
        description={asset?.description}
        image={asset?.image}
      />
      <SimpleGrid spacing={6} columns={{ md: 2 }}>
        <AspectRatio ratio={1}>
          <Center
            flexDirection="column"
            rounded={{ md: 'xl' }}
            p={12}
            bg="brand.50"
          >
            {loading || !asset ? (
              <Skeleton width="100%" height="100%" />
            ) : (
              <TokenMedia
                imageUrl={asset.image}
                animationUrl={asset.animationUrl}
                unlockedContent={
                  showPreview ? undefined : asset.unlockedContent
                }
                defaultText={asset.name}
                controls
                sizes="
              (min-width: 80em) 500px,
              (min-width: 48em) 50vw,
              100vw"
              />
            )}
            {asset && asset.hasUnlockableContent && (
              <Flex
                w="full"
                mt={3}
                direction={{ base: 'column', lg: 'row' }}
                justify={{
                  base: 'center',
                  lg: isOwner ? 'space-between' : 'center',
                }}
                align="center"
                gap={4}
              >
                <Flex align="center" gap={1.5}>
                  <Heading as="h3" variant="heading3" color="brand.black">
                    {t('asset.detail.unlockable.title')}
                  </Heading>
                  <Tooltip
                    label={
                      <Text as="span" variant="caption" color="brand.black">
                        {t('asset.detail.unlockable.tooltip')}
                      </Text>
                    }
                    placement="top"
                    rounded="xl"
                    shadow="lg"
                    p={3}
                    bg="white"
                  >
                    <span>
                      <Icon
                        as={FaInfoCircle}
                        color="gray.400"
                        h={4}
                        w={4}
                        cursor="pointer"
                      />
                    </span>
                  </Tooltip>
                </Flex>
                {isOwner && (
                  <Flex as={FormControl} w="auto" align="center">
                    <FormLabel mb={0} htmlFor="show-preview">
                      <Heading as="h3" variant="heading3" color="brand.black">
                        {t('asset.detail.show-preview')}
                      </Heading>
                    </FormLabel>
                    <Switch
                      id="show-preview"
                      isChecked={showPreview}
                      onChange={(event) => setShowPreview(event.target.checked)}
                    />
                  </Flex>
                )}
              </Flex>
            )}
          </Center>
        </AspectRatio>
        <Flex direction="column" my="auto" gap={8} p={{ base: 6, md: 0 }}>
          <Flex justify="space-between">
            <Stack spacing={1}>
              <Heading as="p" variant="heading1" color="gray.500">
                {loading || !asset ? (
                  <Skeleton height="1em" width="200px" />
                ) : (
                  <Link
                    href={`/collection/${asset.collection.chainId}/${asset.collection.address}`}
                  >
                    {asset.collection.name}
                  </Link>
                )}
              </Heading>
              <Heading
                as="h1"
                variant="title"
                color="brand.black"
                wordBreak="break-word"
              >
                {loading || !asset ? (
                  <Skeleton height="1em" width="300px" />
                ) : (
                  asset.name
                )}
              </Heading>
            </Stack>
            {asset && (
              <Flex direction="row" align="flex-start" gap={3}>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    variant="outline"
                    colorScheme="gray"
                    rounded="full"
                    aria-label="activator"
                    icon={<Icon as={HiOutlineDotsHorizontal} w={5} h={5} />}
                  />
                  <MenuList>
                    <MenuItem onClick={() => refreshMetadata(asset.id)}>
                      {t('asset.detail.menu.refresh-metadata')}
                    </MenuItem>
                    <Link
                      href={`mailto:${
                        environment.REPORT_EMAIL
                      }?subject=${encodeURI(
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
              </Flex>
            )}
          </Flex>

          {loading || !asset ? (
            <SkeletonProperty items={3} />
          ) : (
            <TokenMetadata
              assetId={asset.id}
              creator={creator}
              owners={owners}
              numberOfOwners={asset.ownerships.totalCount}
              saleSupply={BigNumber.from(asset.sales.totalAvailableQuantitySum)}
              standard={asset.collection.standard}
              totalSupply={BigNumber.from(asset.quantity)}
              isOpenCollection={asset.collection.mintType === 'PUBLIC'}
            />
          )}
          {loading || !asset ? (
            <>
              <SkeletonProperty items={1} />
              <Skeleton height="40px" width="100%" />
            </>
          ) : (
            <SaleDetail
              assetId={asset.id}
              chainId={chainId}
              blockExplorer={blockExplorer}
              currencies={chainCurrency.data?.currencies?.nodes || []}
              signer={signer}
              currentAccount={address}
              isSingle={isSingle}
              isHomepage={false}
              isOwner={isOwner}
              auction={auction}
              bestBid={bestBid}
              directSales={directSales}
              ownAllSupply={ownAllSupply}
              onOfferCanceled={refresh}
              onAuctionAccepted={refresh}
            />
          )}
        </Flex>

        {asset && (
          <>
            <Stack p={6} spacing={6}>
              {asset.description && (
                <Stack spacing={3}>
                  <Heading as="h4" variant="heading2" color="brand.black">
                    {t('asset.detail.description')}
                  </Heading>
                  <Stack borderRadius="2xl" p={3} borderWidth="1px" mt={4}>
                    <Text
                      as="p"
                      variant="text-sm"
                      color="gray.500"
                      whiteSpace="pre-wrap"
                    >
                      {linkify(asset.description)}
                    </Text>
                  </Stack>
                </Stack>
              )}

              <Stack spacing={3}>
                <Heading as="h4" variant="heading2" color="brand.black">
                  {t('asset.detail.details.title')}
                </Heading>
                <Stack
                  as="nav"
                  borderRadius="2xl"
                  p={3}
                  borderWidth="1px"
                  mt={8}
                  align="flex-start"
                  spacing={3}
                >
                  <Flex alignItems="center">
                    <Text variant="text-sm" color="gray.500" mr={2}>
                      {t('asset.detail.details.chain')}
                    </Text>
                    <Image
                      src={`/chains/${chainId}.svg`}
                      alt={chainId.toString()}
                      width={20}
                      height={20}
                    />
                    <Text variant="subtitle2" ml={1}>
                      {chain?.name}
                    </Text>
                  </Flex>

                  <Flex alignItems="center">
                    <Text variant="text-sm" color="gray.500" mr={2}>
                      {t('asset.detail.details.explorer')}
                    </Text>
                    <Link href={assetExternalURL} isExternal externalIcon>
                      <Text variant="subtitle2">{blockExplorer.name}</Text>
                    </Link>
                  </Flex>

                  <Flex alignItems="center">
                    <Text variant="text-sm" color="gray.500" mr={2}>
                      {t('asset.detail.details.media')}
                    </Text>
                    <Link href={asset.image} isExternal externalIcon>
                      <Text variant="subtitle2">IPFS</Text>
                    </Link>
                  </Flex>

                  {asset.tokenUri && (
                    <Flex alignItems="center">
                      <Text variant="text-sm" color="gray.500" mr={2}>
                        {t('asset.detail.details.metadata')}
                      </Text>
                      <Link href={asset.tokenUri} isExternal externalIcon>
                        <Text variant="subtitle2">IPFS</Text>
                      </Link>
                    </Flex>
                  )}
                </Stack>
              </Stack>

              {traits && (
                <Stack spacing={3}>
                  <Heading
                    as="h4"
                    variant="heading2"
                    color="brand.black"
                    pb={3}
                  >
                    {t('asset.detail.traits')}
                  </Heading>
                  <Box borderRadius="2xl" p={3} borderWidth="1px">
                    <TraitList
                      chainId={chainId}
                      collectionAddress={collectionAddress}
                      traits={traits}
                    />
                  </Box>
                </Stack>
              )}
            </Stack>

            <div>
              <Tabs
                isManual
                index={tabIndex}
                colorScheme="brand"
                overflowX="auto"
                overflowY="hidden"
              >
                <TabList>
                  {tabs.map((tab) => (
                    <Tab
                      key={tab}
                      as={Link}
                      whiteSpace="nowrap"
                      href={`/tokens/${assetId}?filter=${tab}`}
                      onClick={(e) => {
                        e.preventDefault()
                        void replace(
                          `/tokens/${assetId}?filter=${tab}`,
                          undefined,
                          {
                            shallow: true,
                          },
                        )
                      }}
                    >
                      <Text as="span" variant="subtitle1">
                        {t(`asset.detail.tabs.${tab}`)}
                      </Text>
                    </Tab>
                  ))}
                </TabList>
              </Tabs>
              <Box h={96} overflowY="auto" py={6}>
                {(!query.filter || query.filter === AssetTabs.bids) && (
                  <BidList
                    now={date}
                    chainId={chainId}
                    collectionAddress={collectionAddress}
                    tokenId={tokenId}
                    auctionId={auction?.id}
                    signer={signer}
                    account={address}
                    isSingle={isSingle}
                    preventAcceptation={!isOwner || !!auction}
                    onAccepted={refresh}
                    onCanceled={refresh}
                    totalOwned={totalOwned}
                  />
                )}
                {query.filter === AssetTabs.history && (
                  <HistoryList
                    chainId={chainId}
                    collectionAddress={collectionAddress}
                    tokenId={tokenId}
                  />
                )}
              </Box>
            </div>
          </>
        )}
      </SimpleGrid>
    </LargeLayout>
  )
}

export default DetailPage
