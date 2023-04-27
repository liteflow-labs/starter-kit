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
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import BidList from '../../../components/Bid/BidList'
import Head from '../../../components/Head'
import HistoryList from '../../../components/History/HistoryList'
import Image from '../../../components/Image/Image'
import Link from '../../../components/Link/Link'
import Loader from '../../../components/Loader'
import SaleDetail from '../../../components/Sales/Detail'
import TokenMedia from '../../../components/Token/Media'
import TokenMetadata from '../../../components/Token/Metadata'
import TraitList from '../../../components/Trait/TraitList'
import { chains } from '../../../connectors'
import {
  convertAuctionFull,
  convertBidFull,
  convertHistories,
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

const DetailPage: NextPage<Props> = ({ now: nowProp }) => {
  useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const toast = useToast()
  const { address } = useAccount()
  const { query } = useRouter()
  const [showPreview, setShowPreview] = useState(false)
  const assetId = useRequiredQueryParamSingle('id')

  const date = useMemo(() => new Date(nowProp), [nowProp])
  const { data, refetch, loading } = useFetchAssetQuery({
    variables: {
      id: assetId,
      now: date,
      address: address || '',
    },
  })
  const chainCurrency = useChainCurrencies(data?.asset?.collection.chainId, {
    onlyERC20: true,
  })

  const asset = useMemo(() => data?.asset, [data])
  const currencies = useMemo(
    () => chainCurrency.data?.currencies?.nodes || [],
    [chainCurrency],
  )

  const blockExplorer = useBlockExplorer(asset?.collection.chainId)

  const totalOwned = useMemo(
    () => BigNumber.from(asset?.owned.aggregates?.sum?.quantity || '0'),
    [asset],
  )
  const isOwner = useMemo(() => totalOwned.gt('0'), [totalOwned])
  const ownAllSupply = useMemo(
    () =>
      totalOwned.gte(
        BigNumber.from(asset?.ownerships.aggregates?.sum?.quantity || '0'),
      ),
    [asset, totalOwned],
  )
  const isSingle = useMemo(
    () => asset?.collection.standard === 'ERC721',
    [asset],
  )
  const chain = useMemo(
    () => chains.find((x) => x.id === asset?.chainId),
    [asset],
  )

  const tabs = [
    {
      title: t('asset.detail.tabs.bids'),
      href: `/tokens/${assetId}?filter=bids`,
      type: AssetTabs.bids,
    },
    {
      title: t('asset.detail.tabs.history'),
      href: `/tokens/${assetId}?filter=history`,
      type: AssetTabs.history,
    },
  ]

  const traits = useMemo(
    () =>
      asset &&
      asset.traits.nodes.length > 0 &&
      asset.collection.traits &&
      convertTraits(asset),
    [asset],
  )

  const defaultIndex = query.filter
    ? tabs.findIndex((tab) => tab.type === query.filter)
    : 0

  const assetExternalURL = useMemo(() => {
    if (!asset) return ''
    return blockExplorer.token(asset.collectionAddress, asset.tokenId)
  }, [asset, blockExplorer])

  const now = useNow()
  const activeAuction = useMemo(() => {
    const auction = asset?.auctions.nodes[0]
    if (!auction) return
    // check if auction is expired
    if (new Date(auction.expireAt) <= now) return
    // check if auction has a winning offer
    if (!!auction.winningOffer?.id) return
    return auction
  }, [asset, now])

  const bids = useMemo(() => {
    if (!asset) return []
    return activeAuction
      ? activeAuction.offers.nodes.map(convertBidFull)
      : asset.bids.nodes.length > 0
      ? asset.bids.nodes.map(convertBidFull)
      : []
  }, [activeAuction, asset])

  const directSales = useMemo(
    () => asset?.sales.nodes.map(convertSaleFull) || [],
    [asset],
  )

  const auction = useMemo(
    () =>
      asset?.auctions.nodes.map((auction) => convertAuctionFull(auction))[0],
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

  const histories = useMemo(
    () => asset?.histories.nodes.map(convertHistories) || [],
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

  if (loading) return <Loader fullPage />
  if (!asset) return <></>
  return (
    <LargeLayout>
      <Head
        title={asset.name}
        description={asset.description}
        image={asset.image}
      />
      <SimpleGrid spacing={6} columns={{ md: 2 }}>
        <AspectRatio ratio={1}>
          <Center
            flexDirection="column"
            rounded={{ md: 'xl' }}
            p={12}
            bg="brand.50"
          >
            <TokenMedia
              imageUrl={asset.image}
              animationUrl={asset.animationUrl}
              unlockedContent={showPreview ? undefined : asset.unlockedContent}
              defaultText={asset.name}
              controls
              sizes="
              (min-width: 80em) 500px,
              (min-width: 48em) 50vw,
              100vw"
            />
            {asset.hasUnlockableContent && (
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
              {asset.collection.name && (
                <Heading as="p" variant="heading1" color="gray.500">
                  <Link
                    href={`/collection/${asset.collection.chainId}/${asset.collection.address}`}
                  >
                    {asset.collection.name}
                  </Link>
                </Heading>
              )}
              <Heading
                as="h1"
                variant="title"
                color="brand.black"
                wordBreak="break-word"
              >
                {asset.name}
              </Heading>
            </Stack>
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
          </Flex>

          <TokenMetadata
            assetId={asset.id}
            creator={creator}
            owners={owners}
            numberOfOwners={asset.ownerships.totalCount}
            saleSupply={BigNumber.from(
              asset.sales.aggregates?.sum?.availableQuantity || 0,
            )}
            standard={asset.collection.standard}
            totalSupply={BigNumber.from(
              asset.ownerships.aggregates?.sum?.quantity || '0',
            )}
            isOpenCollection={asset.collection.mintType === 'PUBLIC'}
          />
          <SaleDetail
            assetId={asset.id}
            chainId={asset.collection.chainId}
            blockExplorer={blockExplorer}
            currencies={currencies}
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
        </Flex>

        <Stack p={6} spacing={6}>
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
                  src={`/chains/${asset.collection.chainId}.svg`}
                  alt={asset.collection.chainId.toString()}
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
              <Heading as="h4" variant="heading2" color="brand.black" pb={3}>
                {t('asset.detail.traits')}
              </Heading>
              <Box borderRadius="2xl" p={3} borderWidth="1px">
                <TraitList traits={traits} />
              </Box>
            </Stack>
          )}
        </Stack>

        <div>
          <Tabs
            isManual
            defaultIndex={defaultIndex}
            colorScheme="brand"
            overflowX="auto"
            overflowY="hidden"
          >
            <TabList>
              {tabs.map((tab, index) => (
                <Link key={index} href={tab.href} whiteSpace="nowrap" mr={4}>
                  <Tab>
                    <Text as="span" variant="subtitle1">
                      {tab.title}
                    </Text>
                  </Tab>
                </Link>
              ))}
            </TabList>
          </Tabs>
          <Box h={96} overflowY="auto" py={6}>
            {(!query.filter || query.filter === AssetTabs.bids) && (
              <BidList
                bids={bids}
                chainId={asset.collection.chainId}
                signer={signer}
                account={address}
                isSingle={isSingle}
                blockExplorer={blockExplorer}
                preventAcceptation={!isOwner || !!activeAuction}
                onAccepted={refresh}
                onCanceled={refresh}
                totalOwned={totalOwned}
              />
            )}
            {query.filter === AssetTabs.history && (
              <HistoryList
                histories={histories}
                blockExplorer={blockExplorer}
              />
            )}
          </Box>
        </div>
      </SimpleGrid>
    </LargeLayout>
  )
}

export default DetailPage
