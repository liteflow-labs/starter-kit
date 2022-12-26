import { Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import useTranslation from 'next-translate/useTranslation'
import { VFC } from 'react'
import invariant from 'ts-invariant'
import { AssetHistoryAction } from '../../graphql'
import { BlockExplorer } from '../../hooks/useBlockExplorer'
import List from '../List/List'
import {
  ListingListItem,
  MintListItem,
  PurchaseListItem,
  TransferListItem,
} from './ListItem'
import LazyMintListItem from './ListItem/LazyMintListItem'

type IProps = {
  histories: {
    action: AssetHistoryAction
    date: Date
    quantity: BigNumber
    unitPrice: BigNumber | null
    fromAddress: string
    from: {
      name: string | null
      image: string | null
      verified: boolean
    } | null
    toAddress: string | null
    to: {
      name: string | null
      image: string | null
      verified: boolean
    } | null
    transactionHash: string | null
    currency: {
      decimals: number
      symbol: string
    } | null
  }[]
  blockExplorer: BlockExplorer
}

const HistoryList: VFC<IProps> = ({ histories, blockExplorer }) => {
  const { t } = useTranslation('components')
  const ListItem = (history: IProps['histories'][0], i: number) => {
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
  if (histories.length === 0)
    return (
      <Text as="p" variant="text" color="gray.500">
        {t('history.none')}
      </Text>
    )
  return <List>{histories.map((history, i) => ListItem(history, i))}</List>
}

export default HistoryList
