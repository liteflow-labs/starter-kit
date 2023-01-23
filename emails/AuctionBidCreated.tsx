import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { Webhooks } from '@nft/webhook'
import environment from '../environment'
import Layout from './components/Layout'
import Link from './components/Link'
import Text from './components/Text'
import Title from './components/Title'

export default function AuctionBidCreated({
  asset,
  maker,
  taker,
  unitPrice,
  quantity,
}: Webhooks['AUCTION_BID_CREATED']): JSX.Element {
  return (
    <Layout preview={`You received a new bid for you auction on ${asset.name}`}>
      <Title>New bid for your auction</Title>
      <Text>Hi {taker && (taker.username || taker.address)}</Text>
      <Text>
        We are pleased to let you know that you have received a new bid of{' '}
        <strong>
          {formatUnits(
            BigNumber.from(unitPrice.amount).mul(quantity),
            unitPrice.currency.decimals,
          )}
          {unitPrice.currency.symbol}
        </strong>{' '}
        from <strong>{maker.username || maker.address}</strong> for your auction
        on <strong>{asset.name}</strong>.
      </Text>
      <Text>To view the bid click the link below</Text>

      <Link href={`${environment.BASE_URL}/tokens/${asset.id}`} target="_blank">
        View the bid
      </Link>
    </Layout>
  )
}
