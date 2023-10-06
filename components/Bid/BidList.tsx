import { Text } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import useTranslation from 'next-translate/useTranslation'
import { FC, Fragment } from 'react'
import useBlockExplorer from '../../hooks/useBlockExplorer'
import List from '../List/List'
import SkeletonList from '../Skeleton/List'
import SkeletonListItem from '../Skeleton/ListItem'
import Bid, { type Props as BidProps } from './Bid'

type Props = {
  bids:
    | (BidProps['bid'] & {
        currency: { id: string }
      })[]
    | undefined
  chainId: number
  isSingle: boolean
  preventAcceptation: boolean
  totalOwned: BigNumber
  onAccepted: (id: string) => Promise<void>
  onCanceled: (id: string) => Promise<void>
}

const BidList: FC<Props> = ({
  bids,
  chainId,
  isSingle,
  preventAcceptation,
  totalOwned,
  onAccepted,
  onCanceled,
}) => {
  const { t } = useTranslation('components')
  const blockExplorer = useBlockExplorer(chainId)

  if (bids === undefined)
    return (
      <SkeletonList items={5}>
        <SkeletonListItem image subtitle caption />
      </SkeletonList>
    )
  if (bids.length === 0)
    return (
      <Text as="p" variant="text" color="gray.500">
        {t('bid.list.none')}
      </Text>
    )
  return (
    <List>
      {bids.map((bid, i) => (
        <Fragment key={i}>
          {i > 0 && bids[i - 1]?.currency.id !== bid.currency.id && <hr />}
          <Bid
            bid={bid}
            chainId={chainId}
            preventAcceptation={preventAcceptation}
            blockExplorer={blockExplorer}
            onAccepted={onAccepted}
            onCanceled={onCanceled}
            isSingle={isSingle}
            totalOwned={totalOwned}
          />
        </Fragment>
      ))}
    </List>
  )
}

export default BidList
