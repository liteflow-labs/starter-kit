import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { Events } from '@nft/webhook'
import { formatDate } from '../utils'

export default function AuctionEndedWonBuyer({
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
  if (!bestBid.maker?.email) return null
  return {
    to: bestBid.maker.email,
    subject: `You won the auction for ${asset.name}`,
    html: `Hi <strong>${
      bestBid.maker.username || bestBid.maker.address
    }</strong>,<br/>
    <br/>
    We are pleased to let you know that you won the auction for the NFT <strong>${
      asset.name
    }</strong> for <strong>${formatUnits(bidAmount, currency.decimals)} ${
      currency.symbol
    }</strong>.<br/>
    <br/>
    <strong>${
      creator.username || creator.address
    }</strong> has until the <strong>${formatDate(
      expireAt,
    )}</strong> to confirm the sale.<br/>
    <br/>
    Please make sure that you have <strong>${formatUnits(
      bidAmount,
      currency.decimals,
    )} ${currency.symbol}</strong> available in your wallet.<br/>`,
  }
}
