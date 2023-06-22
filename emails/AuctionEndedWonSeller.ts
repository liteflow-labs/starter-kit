import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { Events } from '@nft/webhook'
import environment from '../environment'
import { formatDate } from '../utils'

export default function AuctionEndedWonSeller({
  asset,
  creator,
  currency,
  reserveAmount,
  bestBid,
  expireAt,
}: Events['AUCTION_ENDED']): {
  html: string
  subject: string
  to: string
} | null {
  if (!bestBid) return null
  const bidAmount = BigNumber.from(bestBid.unitPrice).mul(bestBid.quantity)
  if (bidAmount.lt(reserveAmount)) return null
  if (!creator?.email) return null
  return {
    to: creator.email,
    subject: `Your auction has been won for ${asset.name}`,
    html: `Hi <strong>${creator.username || creator.address}</strong>,<br/>
    <br/>
    We are pleased to let you know that your auction for the NFT <strong>${
      asset.name
    }</strong> has been won by <strong>${
      bestBid.maker.username || bestBid.maker.address
    }</strong> for <strong>${formatUnits(bidAmount, currency.decimals)} ${
      currency.symbol
    }</strong>.<br/>
    <br/>
    You have until the <strong>${formatDate(
      expireAt,
    )}</strong> to confirm the sale. After that the auction and its bids will be canceled.<br/>
    <br/>
    <a href="${environment.BASE_URL}/tokens/${
      asset.id
    }">Confirm the sale</a><br/>`,
  }
}
