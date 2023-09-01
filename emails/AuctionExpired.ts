import { Events } from '@nft/webhook'
import invariant from 'ts-invariant'

export default function AuctionExpired({
  asset,
  creator,
}: Events['AUCTION_EXPIRED']): {
  html: string
  subject: string
  to: string
} | null {
  invariant(process.env.NEXT_PUBLIC_BASE_URL)
  if (!creator?.email) return null
  return {
    to: creator.email,
    subject: `The expiration date has been met for your auction on ${asset.name}`,
    html: `Hi <strong>${creator.username || creator.address}</strong>,<br/>
    <br/>
    The expiration date has been met for <strong>${
      asset.name
    }</strong>. The auction and its bids have been canceled.<br/>
    <br/>
    You can create a new sale for this NFT at anytime.<br/>
    <br/>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/tokens/${
      asset.id
    }">Create a new sale</a><br/>`,
  }
}
