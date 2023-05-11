import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { Events } from '@nft/webhook'
import environment from '../environment'

export default function AuctionBidExpired({
  asset,
  maker,
  unitPrice,
  currency,
  quantity,
}: Events['AUCTION_BID_EXPIRED']): {
  html: string
  subject: string
  to: string
} | null {
  if (!maker?.email) return null
  const amount = BigNumber.from(quantity).mul(unitPrice)
  return {
    to: maker.email,
    subject: `Your bid of ${formatUnits(amount, currency.decimals)} ${
      currency.symbol
    } for the auction on ${asset.name} has met the expiration date`,
    html: `Hi <strong>${maker.username || maker.address}</strong>,<br/>
    <br/>
    The auction for the NFT <strong>${
      asset.name
    }</strong> and your bid placed on it have met the expiration date. Your bid of <strong>${formatUnits(
      amount,
      currency.decimals,
    )} ${currency.symbol}</strong> has been canceled.<br/>
    <br/>
    You can place an open bid for this NFT at anytime. To do so just click the link below that will redirect you to it.<br/>
    <br/>
    <a href="${environment.BASE_URL}/tokens/${
      asset.id
    }">Go to the NFT page</a><br/>`,
  }
}
