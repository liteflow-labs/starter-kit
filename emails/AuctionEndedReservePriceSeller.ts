import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { formatDate } from '@nft/hooks'
import { Events } from '@nft/webhook'
import environment from '../environment'
import { fetchAdditionalAuctionData } from './auction-utils'

export default async function AuctionEndedReservePriceSeller({
  id,
  endAt,
  asset,
  creator,
  currency,
  reserveAmount,
}: Events['AUCTION_ENDED']): Promise<{
  html: string
  subject: string
  to: string
} | null> {
  const { expireAt, bestOffer } = await fetchAdditionalAuctionData(id, endAt)

  if (!bestOffer) return null
  if (BigNumber.from(bestOffer.amount).gte(reserveAmount)) return null
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
