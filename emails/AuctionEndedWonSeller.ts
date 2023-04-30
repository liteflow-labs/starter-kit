import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { formatDate } from '@nft/hooks'
import { Events } from '@nft/webhook'
import environment from '../environment'
import { fetchAdditionalAuctionData } from './auction-utils'

export default async function AuctionEndedWonSeller({
  id,
  asset,
  creator,
  currency,
  reserveAmount,
  endAt,
}: Events['AUCTION_ENDED']): Promise<{
  html: string
  subject: string
  to: string
} | null> {
  const { expireAt, bestOffer } = await fetchAdditionalAuctionData(id, endAt)

  if (!bestOffer) return null
  if (BigNumber.from(bestOffer.amount).lt(reserveAmount)) return null
  if (!creator?.email) return null
  return {
    to: creator.email,
    subject: `Your auction has been won for ${asset.name}`,
    html: `Hi <strong>${creator.username || creator.address}</strong>,<br/>
    <br/>
    We are pleased to let you know that your auction for the NFT <strong>${
      asset.name
    }</strong> has been won by <strong>${
      bestOffer.maker.username || bestOffer.maker.address
    }</strong> for <strong>${formatUnits(
      bestOffer.amount,
      currency.decimals,
    )} ${currency.symbol}</strong>.<br/>
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
