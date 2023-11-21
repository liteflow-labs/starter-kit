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
  useFetchAssetsQuery,
  useFetchDefaultAssetIdsQuery,
} from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useEnvironment from '../../hooks/useEnvironment'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import { useOrderByKey } from '../../hooks/useOrderByKey'
import Link from '../Link/Link'
import SkeletonGrid from '../Skeleton/Grid'
import SkeletonTokenCard from '../Skeleton/TokenCard'
import TokenCard from '../Token/Card'

type Props = {
  date: Date
}

const AssetsHomeSection: FC<Props> = ({ date }) => {
  const { PAGINATION_LIMIT, HOME_TOKENS } = useEnvironment()
  const { address } = useAccount()
  const { t } = useTranslation('templates')
  const defaultAssetQuery = useFetchDefaultAssetIdsQuery({
    variables: { limit: PAGINATION_LIMIT },
    skip: HOME_TOKENS.length > 0,
  })
  useHandleQueryError(defaultAssetQuery)
  const defaultAssetData = defaultAssetQuery.data

  const assetIds = useMemo(() => {
    if (HOME_TOKENS.length > 0) {
      // Pseudo randomize the array based on the date's seconds
      const tokens = [...HOME_TOKENS]

      const seed = date.getTime() / 1000 // convert to seconds as date is currently truncated to the second
      const randomTokens: string[] = []
      while (tokens.length && randomTokens.length < PAGINATION_LIMIT) {
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
    return defaultAssetData?.assets?.nodes.map((x) => x.id)
  }, [HOME_TOKENS, PAGINATION_LIMIT, defaultAssetData, date])

  const assetsQuery = useFetchAssetsQuery({
    variables: {
      now: date,
      limit: PAGINATION_LIMIT,
      assetIds: assetIds || [],
      address: address || '',
    },
    skip: assetIds === undefined,
  })
  useHandleQueryError(assetsQuery)
  const assetData = assetsQuery.data

  const assets = useOrderByKey(
    assetIds,
    assetData?.assets?.nodes,
    (asset) => asset.id,
  )

  if (!assets)
    return (
      <Stack spacing={6}>
        <Skeleton noOfLines={1} height={8} width={200} />
        <SkeletonGrid
          items={PAGINATION_LIMIT}
          columns={{ sm: 2, md: 3, lg: 4 }}
        >
          <SkeletonTokenCard />
        </SkeletonGrid>
      </Stack>
    )

  if (assets.length === 0) return null
  return (
    <Stack spacing={6}>
      <Flex flexWrap="wrap" align="center" justify="space-between" gap={4}>
        <Heading as="h2" variant="subtitle" color="brand.black">
          {t('home.nfts.title')}
        </Heading>
        <Link href="/explore">
          <Button
            variant="outline"
            colorScheme="gray"
            rightIcon={<Icon as={HiArrowNarrowRight} h={5} w={5} />}
            iconSpacing="10px"
          >
            <Text as="span" isTruncated>
              {t('home.nfts.explore')}
            </Text>
          </Button>
        </Link>
      </Flex>
      <SimpleGrid flexWrap="wrap" spacing={4} columns={{ sm: 2, md: 3, lg: 4 }}>
        {assets.map((item, i) => (
          <Flex key={i} justify="center" overflow="hidden">
            <TokenCard asset={item} />
          </Flex>
        ))}
      </SimpleGrid>
    </Stack>
  )
}

export default AssetsHomeSection
