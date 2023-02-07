import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { Events } from '@nft/webhook'
import environment from '../environment'

export default function AuctionBidCreated({
  asset,
  maker,
  taker,
  unitPrice,
  currency,
  quantity,
}: Events['AUCTION_BID_CREATED']): {
  html: string
  subject: string
  to: string
} | null {
  const amount = formatUnits(
    BigNumber.from(unitPrice).mul(quantity),
    currency.decimals,
  )
  if (!taker?.email) return null
  return {
    to: taker.email,
    subject: `New bid of ${amount} ${currency.symbol} received for your auction on ${asset.name}`,
    html: `Hi <strong>${taker.username || taker.address}</strong>,
<br/>
<br/>
We are pleased to let you know that you have received a new bid of <strong>${amount} ${
      currency.symbol
    }</strong> from <strong>${
      maker.username || maker.address
    }</strong> for your auction on <strong>${asset.name}</strong>.
<br/>
<br/>      
To view the bid click the link below.
<br/>
<br/>
<a href="${environment.BASE_URL}/tokens/${asset.id}">View the bid</a>
<br/>`,
  }
}
