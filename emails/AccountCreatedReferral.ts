import { Events } from '@nft/webhook'
import request, { gql } from 'graphql-request'
import invariant from 'ts-invariant'

const getReferrerOf = async (address: string) => {
  invariant(process.env.NEXT_PUBLIC_LITEFLOW_API_KEY)
  const apiUrl = `${
    process.env.NEXT_PUBLIC_LITEFLOW_BASE_URL || 'https://api.liteflow.com'
  }/${process.env.NEXT_PUBLIC_LITEFLOW_API_KEY}/graphql`

  const { account: referrerAddress } = await request<{
    account: { referrerAddress: string | null } | null
  }>(
    apiUrl,
    gql`
      query FetchAccountReferrer($address: Address!) {
        account(address: $address) {
          referrerAddress
        }
      }
    `,
    { address },
  )

  if (!referrerAddress?.referrerAddress) return null

  const { account: referrer } = await request<{
    account: {
      address: string
      email: string | null
      username: string | null
    } | null
  }>(
    apiUrl,
    gql`
      query FetchAccountForReferralEmail($address: Address!) {
        account(address: $address) {
          address
          email
          username
        }
      }
    `,
    { address: referrerAddress.referrerAddress },
  )
  return referrer
}

export default async function AccountCreatedReferral({
  address,
  username,
}: Events['ACCOUNT_CREATED']): Promise<{
  html: string
  subject: string
  to: string
} | null> {
  invariant(process.env.NEXT_PUBLIC_BASE_URL)
  const referrer = await getReferrerOf(address)
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
<br/>
Each time an item created by <strong>${
      username || address
    }</strong> is sold, you will receive a percentage of the sale.<br/>
<br/>
<a href="${process.env.NEXT_PUBLIC_BASE_URL}/referral">How it works?</a><br/>
<br/>`,
  }
}
