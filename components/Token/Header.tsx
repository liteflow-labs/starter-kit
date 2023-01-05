import { Box, Flex, Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import { useMemo, VFC } from 'react'
import { Standard } from '../../graphql'
import { BlockExplorer } from '../../hooks/useBlockExplorer'
import Link from '../Link/Link'
import type { Props as SaleDetailProps } from '../Sales/Detail'
import SaleDetail from '../Sales/Detail'
import TokenMedia from '../Token/Media'
import type { Props as TokenAssetProps } from '../Token/Metadata'
import TokenAsset from '../Token/Metadata'

export type Props = {
  blockExplorer: BlockExplorer
  asset: {
    id: string
    name: string
    image: string
    animationUrl: string | null | undefined
    unlockedContent: { url: string; mimetype: string | null } | null | undefined
    saleSupply: BigNumber
    collection: {
      standard: Standard
    }
    totalSupply: BigNumber
    owned: BigNumber
  }
  currencies: SaleDetailProps['currencies']
  creator: TokenAssetProps['creator']
  owners: TokenAssetProps['owners']
  auction: SaleDetailProps['auction']
  bestBid: SaleDetailProps['bestBid']
  sales: SaleDetailProps['directSales']
  isHomepage: boolean
  signer: Signer | undefined
  currentAccount: string | null | undefined
  onOfferCanceled: (id: string) => Promise<void>
  onAuctionAccepted: (id: string) => Promise<void>
}

const TokenHeader: VFC<Props> = ({
  blockExplorer,
  asset,
  currencies,
  creator,
  owners,
  auction,
  bestBid,
  sales,
  isHomepage,
  signer,
  currentAccount,
  onOfferCanceled,
  onAuctionAccepted,
}) => {
  const isOwner = useMemo(() => asset.owned.gt('0'), [asset])

  const ownAllSupply = useMemo(
    () => asset.owned.gte(asset.totalSupply),
    [asset],
  )
  const isSingle = useMemo(
    () => asset.collection.standard === 'ERC721',
    [asset],
  )

  return (
    <SimpleGrid spacing={4} flex="0 0 100%" columns={{ base: 0, md: 2 }}>
      <Box my="auto" p={{ base: 6, md: 12 }} textAlign="center">
        <Flex
          as={Link}
          href={`/tokens/${asset.id}`}
          mx="auto"
          maxH={96}
          w="full"
          maxW="sm"
          align="center"
          justify="center"
          overflow="hidden"
          rounded="lg"
          shadow="md"
        >
          <TokenMedia
            image={asset.image}
            animationUrl={asset.animationUrl}
            unlockedContent={asset.unlockedContent}
            defaultText={asset.name}
            objectFit="cover"
            width={384}
            height={384}
          />
        </Flex>
      </Box>
      <Stack spacing={8} p={{ base: 6, md: 12 }}>
        <Heading as="h1" variant="title" color="brand.black">
          {asset.name}
        </Heading>
        <TokenAsset
          creator={creator}
          owners={owners}
          saleSupply={asset.saleSupply}
          standard={asset.collection.standard}
          totalSupply={asset.totalSupply}
        />
        <SaleDetail
          blockExplorer={blockExplorer}
          assetId={asset.id}
          currencies={currencies}
          isHomepage={isHomepage}
          isOwner={isOwner}
          isSingle={isSingle}
          ownAllSupply={ownAllSupply}
          auction={auction}
          bestBid={bestBid}
          directSales={sales}
          signer={signer}
          currentAccount={currentAccount}
          onOfferCanceled={onOfferCanceled}
          onAuctionAccepted={onAuctionAccepted}
        />
      </Stack>
    </SimpleGrid>
  )
}

export default TokenHeader
