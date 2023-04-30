import { Events } from '@nft/webhook'
import environment from '../environment'

export default function OfferExpired({
  asset,
  maker,
}: Events['OFFER_EXPIRED']): {
  html: string
  subject: string
  to: string
} | null {
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
    <a href="${environment.BASE_URL}/tokens/${
      asset.id
    }">Create a new sale</a><br/>`,
  }
}
