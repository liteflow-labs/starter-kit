import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { formatDate } from '@nft/hooks'
import { Webhooks } from '@nft/webhook'
import environment from '../environment'
import Layout from './components/Layout'
import Link from './components/Link'
import Text from './components/Text'
import Title from './components/Title'

export default function BidCreated({
  asset,
  maker,
  taker,
  unitPrice,
  quantity,
  expiredAt,
}: Webhooks['BID_CREATED']): JSX.Element {
  return (
    <Layout preview={`You received a new bid for ${asset.name}`}>
      <Title>New Bid</Title>
      <Text>Hi {taker && (taker.username || taker.address)}</Text>
      <Text>
        We are pleased to let you know that you have received a new bid from{' '}
        <strong>{maker.username || maker.address}</strong> for{' '}
        <strong>
          {quantity.toString()}{' '}
          {BigNumber.from(quantity).gt(1) ? 'editions' : 'edition'}
        </strong>{' '}
        of <strong>{asset.name}</strong> for{' '}
        <strong>
          {formatUnits(unitPrice.amount, unitPrice.currency.decimals)}
          {unitPrice.currency.symbol}
        </strong>
        {BigNumber.from(quantity).gt(1) && ' each'}.
      </Text>
      <Text>
        You have until the {formatDate(expiredAt)} to accept it. After that the
        bid will be expired.
      </Text>
      <Text>
        To do so just click the link below that will redirect you to it.
      </Text>

      <Link href={`${environment.BASE_URL}/tokens/${asset.id}`} target="_blank">
        Go to the NFT page
      </Link>
    </Layout>
  )
}
