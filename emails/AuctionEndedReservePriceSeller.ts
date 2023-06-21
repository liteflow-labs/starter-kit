import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { Events } from '@nft/webhook'
import environment from '../environment'
import { formatDate } from '../utils'

export default function AuctionEndedReservePriceSeller({
  asset,
  creator,
  currency,
  reserveAmount,
  expireAt,
  bestBid,
}: Events['AUCTION_ENDED']): {
  html: string
  subject: string
  to: string
} | null {
  if (!bestBid) return null
  const bidAmount = BigNumber.from(bestBid.unitPrice).mul(bestBid.quantity)
  if (bidAmount.gte(reserveAmount)) return null
  if (!creator?.email) return null
  return {
    to: creator.email,
    subject: `Your auction has ended but the reserve price hasn't been met for ${asset.name}`,
    html: `Hi <strong>${creator.username || creator.address}</strong>,<br/>
    <br/>
    Your auction for the NFT <strong>${
      asset.name
    }</strong> has ended but the reserve price of <strong>${formatUnits(
      reserveAmount,
      currency.decimals,
    )} ${currency.symbol}</strong> hasn't been met.<br/>
    <br/>
    Friendly tips, create a new sale for this NFT and share it around you to gather interest.<br/>
    <br/>
    Without action from your side after the <strong>${formatDate(
      expireAt,
    )}</strong>, the auction and its bids will be canceled.<br/>
    <br/>
    <a href="${environment.BASE_URL}/tokens/${
      asset.id
    }">Create a new sale</a><br/>`,
  }
}
