import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { formatDate } from '@nft/hooks'
import { Events } from '@nft/webhook'
import { fetchAdditionalAuctionData } from './auction-utils'

export default async function AuctionEndedWonBuyer({
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
  if (BigNumber.from(bestOffer.amount).lt(reserveAmount)) return null
  if (!bestOffer.maker?.email) return null
  return {
    to: bestOffer.maker.email,
    subject: `You won the auction for ${asset.name}`,
    html: `Hi <strong>${
      bestOffer.maker.username || bestOffer.maker.address
    }</strong>,<br/>
    <br/>
    We are pleased to let you know that you won the auction for the NFT <strong>${
      asset.name
    }</strong> for <strong>${formatUnits(
      bestOffer.amount,
      currency.decimals,
    )} ${currency.symbol}</strong>.<br/>
    <br/>
    <strong>${
      creator.username || creator.address
    }</strong> has until the <strong>${formatDate(
      expireAt,
    )}</strong> to confirm the sale.<br/>
    <br/>
    Please make sure that you have <strong>${formatUnits(
      bestOffer.amount,
      currency.decimals,
    )} ${currency.symbol}</strong> available in your wallet.<br/>`,
  }
}
