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
  FetchAssetsQuery,
  useFetchAssetsQuery,
  useFetchDefaultAssetIdsQuery,
} from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import useOrderById from '../../hooks/useOrderById'
import TokenCard from '../Token/Card'
import HomeGridSection from './Grid'

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
  const defaultAssetData = useMemo(
    () => defaultAssetQuery.data || defaultAssetQuery.previousData,
    [defaultAssetQuery.data, defaultAssetQuery.previousData],
  )

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
    return (defaultAssetData?.assets?.nodes || []).map((x) => x.id)
  }, [defaultAssetData, date])

  const assetsQuery = useFetchAssetsQuery({
    variables: {
      now: date,
      limit: environment.PAGINATION_LIMIT,
      assetIds: assetIds,
      address: address || '',
    },
  })
  useHandleQueryError(assetsQuery)
  const assetData = useMemo(
    () => assetsQuery.data || assetsQuery.previousData,
    [assetsQuery.data, assetsQuery.previousData],
  )

  const assets = useOrderById(assetIds, assetData?.assets?.nodes || [])
  return (
    <HomeGridSection
      explore={{ href: '/explore', title: t('home.nfts.explore') }}
      isLoading={
        (defaultAssetQuery.loading && !defaultAssetData) ||
        (assetsQuery.loading && !assetData)
      }
      items={assets}
      itemRender={(
        item: NonNullable<FetchAssetsQuery['assets']>['nodes'][number],
      ) => (
        <TokenCard
          asset={convertAsset(item)}
          creator={convertUser(item.creator, item.creator.address)}
          sale={convertSale(item.firstSale.nodes[0])}
          auction={
            item.auctions.nodes[0]
              ? convertAuctionWithBestBid(item.auctions.nodes[0])
              : undefined
          }
          numberOfSales={item.firstSale.totalCount}
          hasMultiCurrency={item.firstSale.totalCurrencyDistinctCount > 1}
        />
      )}
      title={t('home.nfts.title')}
    />
  )
}

export default AssetsHomeSection
