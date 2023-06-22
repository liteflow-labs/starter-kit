import { BigNumber } from '@ethersproject/bignumber'
import { Events } from '@nft/webhook'
import environment from '../environment'
import { formatDate } from '../utils'

export default function AuctionEndedReservePriceBuyer({
  asset,
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
  if (!bestBid.maker?.email) return null
  return {
    to: bestBid.maker.email,
    subject: `The auction has ended but the reserve price hasn't been met for ${asset.name}`,
    html: `Hi <strong>${
      bestBid.maker.username || bestBid.maker.address
    }</strong>,<br/>
    <br/>
    You recently participated in an auction for the NFT <strong>${
      asset.name
    }</strong> which has ended.<br/>
    <br/>
    Unfortunately the reserve price for this auction hasn't been met. After the <strong>${formatDate(
      expireAt,
    )}</strong>, the auction and the bid you placed will be canceled.<br/>
    <br/>
    Keep an eye on this NFT as the owner might list it for sale again!<br/>
    <br/>
    <a href="${environment.BASE_URL}/tokens/${
      asset.id
    }">Go to the NFT page</a><br/>`,
  }
}
