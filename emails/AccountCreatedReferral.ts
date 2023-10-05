import { Events } from '@nft/webhook'
import invariant from 'ts-invariant'

export default function AccountCreatedReferral({
  address,
  username,
  referrer,
}: Events['ACCOUNT_CREATED']): {
  html: string
  subject: string
  to: string
} | null {
  invariant(process.env.NEXT_PUBLIC_BASE_URL)
  if (!referrer?.email) return null
  return {
    to: referrer.email,
    subject: `${
      username || address
    } successfully registered with your referral link`,
    html: `Hi <strong>${referrer.username || referrer.address}</strong>,<br/>
<br/>
We are pleased to let you know that <strong>${
      username || address
    }</strong> successfully registered on ${
      process.env.NEXT_PUBLIC_BASE_URL
    } with your referral link.<br/>
<br/>`,
  }
}
