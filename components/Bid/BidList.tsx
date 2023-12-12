import { Text } from '@chakra-ui/react'
import useTranslation from 'next-translate/useTranslation'
import { FC, Fragment } from 'react'
import List from '../List/List'
import SkeletonList from '../Skeleton/List'
import SkeletonListItem from '../Skeleton/ListItem'
import Bid, { type Props as BidProps } from './Bid'

type Props = {
  asset: BidProps['asset']
  bids:
    | (BidProps['bid'] & {
        currency: { id: string }
      })[]
    | undefined
  preventAcceptation: boolean
  onAccepted: (id: string) => Promise<void>
  onCanceled: (id: string) => Promise<void>
}

const BidList: FC<Props> = ({
  asset,
  bids,
  preventAcceptation,
  onAccepted,
  onCanceled,
}) => {
  const { t } = useTranslation('components')

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
            asset={asset}
            bid={bid}
            preventAcceptation={preventAcceptation}
            onAccepted={onAccepted}
            onCanceled={onCanceled}
          />
        </Fragment>
      ))}
    </List>
  )
}

export default BidList
