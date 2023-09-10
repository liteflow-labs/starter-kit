import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { Events } from '@nft/webhook'
import invariant from 'ts-invariant'

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
  invariant(process.env.NEXT_PUBLIC_BASE_URL)
  const amount = BigNumber.from(unitPrice).mul(quantity)
  if (!taker?.email) return null
  return {
    to: taker.email,
    subject: `New bid of ${formatUnits(amount, currency.decimals)} ${
      currency.symbol
    } received for your auction on ${asset.name}`,
    html: `Hi <strong>${taker.username || taker.address}</strong>,<br/>
    <br/>
    We are pleased to let you know that you have received a new bid of <strong>${formatUnits(
      amount,
      currency.decimals,
    )} ${currency.symbol}</strong> from <strong>${
      maker.username || maker.address
    }</strong> for your auction on <strong>${asset.name}</strong>.<br/>
    <br/>      
    To view the bid click the link below.<br/>
    <br/>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/tokens/${
      asset.id
    }">View the bid</a><br/>`,
  }
}
