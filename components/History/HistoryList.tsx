import { Text } from '@chakra-ui/react'
import BurnListItem from 'components/History/ListItem/BurnListItem'
import useTranslation from 'next-translate/useTranslation'
import { FC, useCallback, useMemo, useState } from 'react'
import invariant from 'ts-invariant'
import {
  AssetHistoryAction,
  FetchAssetHistoryQuery,
  useFetchAssetHistoryQuery,
} from '../../graphql'
import useBlockExplorer from '../../hooks/useBlockExplorer'
import HistoryListFilter, {
  DEFAULT_HISTORY_FILTER,
} from '../History/HistoryListFilter'
import List from '../List/List'
import Pagination from '../Pagination/Pagination'
import SkeletonList from '../Skeleton/List'
import SkeletonListItem from '../Skeleton/ListItem'
import {
  ListingListItem,
  MintListItem,
  PurchaseListItem,
  TransferListItem,
} from './ListItem'
import LazyMintListItem from './ListItem/LazyMintListItem'

type IProps = {
  chainId: number
  collectionAddress: string
  tokenId: string
  filter?: AssetHistoryAction[]
}

const LIMIT = 5

const HistoryList: FC<IProps> = ({ chainId, collectionAddress, tokenId }) => {
  const { t } = useTranslation('components')
  const blockExplorer = useBlockExplorer(chainId)
  const [filter, setFilter] = useState<AssetHistoryAction[]>(
    DEFAULT_HISTORY_FILTER,
  )

  const [page, setPage] = useState(1)
  const offset = useMemo(() => (page - 1) * LIMIT, [page])
  const onFilterChange = useCallback((filter: AssetHistoryAction[]) => {
    setPage(1)
    setFilter(filter)
  }, [])

  const { data: historyData } = useFetchAssetHistoryQuery({
    variables: {
      chainId,
      collectionAddress,
      tokenId,
      limit: LIMIT,
      offset,
      filter,
    },
  })
  const histories = historyData?.asset?.histories.nodes

  const ListItem = (
    history: NonNullable<
      FetchAssetHistoryQuery['asset']
    >['histories']['nodes'][0],
    i: number,
  ) => {
    switch (history.action) {
      case 'LISTING':
        invariant(history.unitPrice, 'unitPrice is required')
        return (
          <ListingListItem {...history} key={i} unitPrice={history.unitPrice} />
        )

      case 'PURCHASE':
        invariant(history.unitPrice, 'unitPrice is required')
        invariant(history.toAddress, 'toAddress is required')
        return (
          <PurchaseListItem
            {...history}
            key={i}
            unitPrice={history.unitPrice}
            toAddress={history.toAddress}
            blockExplorer={blockExplorer}
          />
        )

      case 'TRANSFER':
        invariant(history.toAddress, 'toAddress is required')
        return (
          <TransferListItem
            {...history}
            key={i}
            toAddress={history.toAddress}
            blockExplorer={blockExplorer}
          />
        )

      case 'MINT':
        invariant(history.toAddress, 'toAddress is required')
        return (
          <MintListItem
            {...history}
            key={i}
            blockExplorer={blockExplorer}
            toAddress={history.toAddress}
          />
        )

      case 'BURN':
        invariant(history.fromAddress, 'fromAddress is required')
        return (
          <BurnListItem
            {...history}
            key={i}
            fromAddress={history.fromAddress}
          />
        )

      case 'LAZYMINT':
        return <LazyMintListItem {...history} key={i} />
    }
  }

  return (
    <>
      <HistoryListFilter filter={filter} onFilterChange={onFilterChange} />
      {!histories ? (
        <SkeletonList items={5}>
          <SkeletonListItem image subtitle caption />
        </SkeletonList>
      ) : histories.length > 0 ? (
        <List>{histories.map((history, i) => ListItem(history, i))}</List>
      ) : (
        <Text as="p" variant="text" color="gray.500">
          {t('history.none')}
        </Text>
      )}
      {histories?.length !== 0 && (
        <Pagination
          page={page}
          onPageChange={setPage}
          hasNextPage={historyData?.asset?.histories.pageInfo.hasNextPage}
          hasPreviousPage={
            historyData?.asset?.histories.pageInfo.hasPreviousPage
          }
          withoutLimit
          withoutNumbers
        />
      )}
    </>
  )
}

export default HistoryList
