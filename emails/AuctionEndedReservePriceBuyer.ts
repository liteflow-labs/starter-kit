import { BigNumber } from '@ethersproject/bignumber'
import { formatDate } from '@nft/hooks'
import { Events } from '@nft/webhook'
import environment from '../environment'
import { fetchAdditionalAuctionData } from './auction-utils'

export default async function AuctionEndedReservePriceBuyer({
  id,
  endAt,
  asset,
  reserveAmount,
}: Events['AUCTION_ENDED']): Promise<{
  html: string
  subject: string
  to: string
} | null> {
  const { expireAt, bestOffer } = await fetchAdditionalAuctionData(id, endAt)

  if (!bestOffer) return null
  if (BigNumber.from(bestOffer.amount).gte(reserveAmount)) return null
  if (!bestOffer.maker?.email) return null
  return {
    to: bestOffer.maker.email,
    subject: `The auction has ended but the reserve price hasn't been met for ${asset.name}`,
    html: `Hi <strong>${
      bestOffer.maker.username || bestOffer.maker.address
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
