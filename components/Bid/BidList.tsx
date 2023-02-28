import { Text } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import useTranslation from 'next-translate/useTranslation'
import { VFC } from 'react'
import { BlockExplorer } from '../../hooks/useBlockExplorer'
import List from '../List/List'
import type { Props as BidProps } from './Bid'
import Bid from './Bid'

type Props = {
  bids: (BidProps['bid'] & { currency: { id: string } })[]
  chainId: number
  signer: Signer | undefined
  account: string | null | undefined
  isSingle: boolean
  blockExplorer: BlockExplorer
  preventAcceptation: boolean
  totalOwned: BigNumber
  onAccepted: (id: string) => Promise<void>
  onCanceled: (id: string) => Promise<void>
}

const BidList: VFC<Props> = ({
  bids,
  chainId,
  signer,
  account,
  isSingle,
  blockExplorer,
  preventAcceptation,
  totalOwned,
  onAccepted,
  onCanceled,
}) => {
  const { t } = useTranslation('components')
  if (bids.length === 0)
    return (
      <Text as="p" variant="text" color="gray.500">
        {t('bid.list.none')}
      </Text>
    )
  return (
    <List>
      {bids.map((bid, i) => (
        <>
          {i > 0 && bids[i - 1]?.currency.id !== bid.currency.id && <hr />}
          <Bid
            bid={bid}
            chainId={chainId}
            key={bid.id}
            signer={signer}
            account={account}
            preventAcceptation={preventAcceptation}
            blockExplorer={blockExplorer}
            onAccepted={onAccepted}
            onCanceled={onCanceled}
            isSingle={isSingle}
            totalOwned={totalOwned}
          />
        </>
      ))}
    </List>
  )
}

export default BidList
