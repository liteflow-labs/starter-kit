import {
  Button,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertSale,
  convertUser,
} from '../../convert'
import environment from '../../environment'
import {
  useFetchAssetsQuery,
  useFetchDefaultAssetIdsQuery,
} from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import useOrderById from '../../hooks/useOrderById'
import Link from '../Link/Link'
import SkeletonGrid from '../Skeleton/Grid'
import SkeletonTokenCard from '../Skeleton/TokenCard'
import TokenCard from '../Token/Card'

type Props = {
  date: Date
}

const AssetsHomeSection: FC<Props> = ({ date }) => {
  const { address } = useAccount()
  const { t } = useTranslation('templates')
  const defaultAssetQuery = useFetchDefaultAssetIdsQuery({
    variables: { limit: environment.PAGINATION_LIMIT },
    skip: !!environment.HOME_TOKENS,
  })
  useHandleQueryError(defaultAssetQuery)

  const assetIds = useMemo(() => {
    if (environment.HOME_TOKENS) {
      // Pseudo randomize the array based on the date's seconds
      const tokens = [...environment.HOME_TOKENS]

      const seed = date.getTime() / 1000 // convert to seconds as date is currently truncated to the second
      const randomTokens = []
      while (
        tokens.length &&
        randomTokens.length < environment.PAGINATION_LIMIT
      ) {
        // generate random based on seed and length of the remaining tokens array
        // It will change when seed changes (basically every request) and also on each iteration of the loop as length of tokens changes
        const randomIndex = seed % tokens.length
        // remove the element from tokens
        const element = tokens.splice(randomIndex, 1)
        // push the element into the returned array in order
        randomTokens.push(...element)
      }
      return randomTokens
    }
    return (defaultAssetQuery.data?.assets?.nodes || []).map((x) => x.id)
  }, [defaultAssetQuery, date])

  const assetsQuery = useFetchAssetsQuery({
    variables: {
      now: date,
      limit: environment.PAGINATION_LIMIT,
      assetIds: assetIds,
      address: address || '',
    },
  })

  useHandleQueryError(assetsQuery)

  const assets = useOrderById(assetIds, assetsQuery.data?.assets?.nodes)

  if (defaultAssetQuery.loading || assetsQuery.loading)
    return (
      <Stack spacing={6}>
        <Skeleton noOfLines={1} height={8} width={200} />
        <SkeletonGrid items={environment.PAGINATION_LIMIT}>
          <SkeletonTokenCard />
        </SkeletonGrid>
      </Stack>
    )
  if (assets.length === 0) return null
  return (
    <Stack spacing={6}>
      <Flex flexWrap="wrap" justify="space-between" gap={4}>
        <Heading as="h2" variant="subtitle" color="brand.black">
          {t('home.featured')}
        </Heading>
        <Link href="/explore">
          <Button
            variant="outline"
            colorScheme="gray"
            rightIcon={<Icon as={HiArrowNarrowRight} h={5} w={5} />}
            iconSpacing="10px"
          >
            <Text as="span" isTruncated>
              {t('home.explore')}
            </Text>
          </Button>
        </Link>
      </Flex>
      <SimpleGrid spacing={6} columns={{ sm: 2, md: 3, lg: 4 }}>
        {assets.map((x, i) => (
          <Flex key={i} justify="center" overflow="hidden">
            <TokenCard
              asset={convertAsset(x)}
              creator={convertUser(x.creator, x.creator.address)}
              sale={convertSale(x.firstSale.nodes[0])}
              auction={
                x.auctions.nodes[0]
                  ? convertAuctionWithBestBid(x.auctions.nodes[0])
                  : undefined
              }
              numberOfSales={x.firstSale.totalCount}
              hasMultiCurrency={
                parseInt(
                  x.currencySales.aggregates?.distinctCount?.currencyId,
                  10,
                ) > 1
              }
            />
          </Flex>
        ))}
      </SimpleGrid>
    </Stack>
  )
}

export default AssetsHomeSection
