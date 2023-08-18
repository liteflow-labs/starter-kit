import { Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import invariant from 'ts-invariant'
import { convertHistories } from '../../convert'
import { useFetchAssetHistoryQuery } from '../../graphql'
import useBlockExplorer from '../../hooks/useBlockExplorer'
import List from '../List/List'
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
}

const HistoryList: FC<IProps> = ({ chainId, collectionAddress, tokenId }) => {
  const { t } = useTranslation('components')

  const { data: historyData } = useFetchAssetHistoryQuery({
    variables: {
      chainId,
      collectionAddress,
      tokenId,
    },
  })
  const blockExplorer = useBlockExplorer(chainId)

  const histories = useMemo(
    () => historyData?.asset?.histories.nodes.map(convertHistories),
    [historyData],
  )

  const ListItem = (
    history: ReturnType<typeof convertHistories>,
    i: number,
  ) => {
    switch (history.action) {
      case 'LISTING':
        invariant(history.unitPrice, 'unitPrice is required')
        return (
          <ListingListItem
            {...history}
            key={i}
            currency={history.currency}
            unitPrice={history.unitPrice}
          />
        )

      case 'PURCHASE':
        invariant(history.unitPrice, 'unitPrice is required')
        invariant(history.toAddress, 'toAddress is required')
        return (
          <PurchaseListItem
            {...history}
            key={i}
            currency={history.currency}
            unitPrice={history.unitPrice}
            toAddress={history.toAddress}
            blockExplorer={blockExplorer}
          />
        )

      case 'TRANSFER':
        invariant(history.toAddress, 'toAddress is required')
        if (
          history.fromAddress === '0x0000000000000000000000000000000000000000'
        ) {
          return (
            <MintListItem
              {...history}
              key={i}
              blockExplorer={blockExplorer}
              toAddress={history.toAddress}
            />
          )
        }
        return (
          <TransferListItem
            {...history}
            key={i}
            toAddress={history.toAddress}
            blockExplorer={blockExplorer}
          />
        )

      case 'LAZYMINT':
        return <LazyMintListItem {...history} key={i} />
    }
  }

  if (!histories)
    return (
      <SkeletonList items={5}>
        <SkeletonListItem image subtitle caption />
      </SkeletonList>
    )
  if (histories.length === 0)
    return (
      <Text as="p" variant="text" color="gray.500">
        {t('history.none')}
      </Text>
    )
  return <List>{histories.map((history, i) => ListItem(history, i))}</List>
}

export default HistoryList
