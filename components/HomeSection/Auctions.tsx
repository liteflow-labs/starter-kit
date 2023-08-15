import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertUser,
} from '../../convert'
import { FetchAuctionsQuery, useFetchAuctionsQuery } from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import TokenCard from '../Token/Card'
import HomeGridSection from './Grid'

type Props = {
  date: Date
}

const AuctionsHomeSection: FC<Props> = ({ date }) => {
  const { address } = useAccount()
  const { t } = useTranslation('templates')
  const auctionAssetsQuery = useFetchAuctionsQuery({
    variables: { now: date, address: address || '' },
  })
  useHandleQueryError(auctionAssetsQuery)
  return (
    <HomeGridSection
      items={auctionAssetsQuery.data?.auctions?.nodes}
      itemRender={(
        item: NonNullable<FetchAuctionsQuery['auctions']>['nodes'][number],
      ) => (
        <TokenCard
          key={item.id}
          asset={convertAsset(item.asset)}
          creator={convertUser(item.asset.creator, item.asset.creator.address)}
          auction={convertAuctionWithBestBid(item)}
          sale={undefined}
          numberOfSales={0}
          hasMultiCurrency={false}
        />
      )}
      title={t('home.auctions')}
    />
  )
}

export default AuctionsHomeSection
