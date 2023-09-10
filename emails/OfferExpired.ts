import { Events } from '@nft/webhook'
import invariant from 'ts-invariant'

export default function OfferExpired({
  asset,
  maker,
}: Events['OFFER_EXPIRED']): {
  html: string
  subject: string
  to: string
} | null {
  invariant(process.env.NEXT_PUBLIC_BASE_URL)
  if (!maker?.email) return null
  return {
    to: maker.email,
    subject: `The expiration date has been met for your sale on ${asset.name}`,
    html: `Hi <strong>${maker.username || maker.address}</strong>,<br/>
    <br/>
    The expiration date has been met for <strong>${
      asset.name
    }</strong>. The sale has been canceled.<br/>
    <br/>
    You can create a new sale for this NFT at anytime. To do so just click the link below that will redirect you to it.<br/>
    <br/>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/tokens/${
      asset.id
    }">Create a new sale</a><br/>`,
  }
}
