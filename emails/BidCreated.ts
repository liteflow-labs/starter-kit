import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { formatDate } from '@nft/hooks'
import { Events } from '@nft/webhook'
import environment from '../environment'

export default function BidCreated({
  asset,
  maker,
  taker,
  unitPrice,
  currency,
  quantity,
  expiredAt,
}: Events['BID_CREATED']): {
  html: string
  subject: string
  to: string
} | null {
  const price = formatUnits(unitPrice, currency.decimals)
  const multiple = BigNumber.from(quantity).gt(1)
  if (!taker?.email) return null
  return {
    to: taker.email,
    subject: `New bid received for ${quantity} edition${
      multiple ? 's' : ''
    } of ${asset.name} for ${price} ${currency.symbol}${
      multiple ? ' each' : ''
    }`,
    html: `Hi <strong>${taker.username || taker.address}</strong>,
<br/>
<br/>
We are pleased to let you know that you have received a new bid from <strong>${
      maker.username || maker.address
    }</strong> for <strong>${quantity}</strong> edition${
      multiple ? 's' : ''
    } of your NFT <strong>${asset.name}</strong> for <strong>${price} ${
      currency.symbol
    }</strong>${multiple ? ' each' : ''}.
<br/>
<br/>
You have until the <strong>${formatDate(
      expiredAt,
    )}</strong> to accept it. After that the bid will be expired.
<br/>
<br/>      
To do so just click the link below that will redirect you to it.<br/>
<br/>
<a href="${environment.BASE_URL}/tokens/${asset.id}">Go to the NFT page</a>
<br/>`,
  }
}
