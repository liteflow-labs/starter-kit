import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { Events } from '@nft/webhook'
import invariant from 'ts-invariant'

export default function BidExpired({
  asset,
  maker,
  unitPrice,
  currency,
  quantity,
}: Events['BID_EXPIRED']): {
  html: string
  subject: string
  to: string
} | null {
  invariant(process.env.NEXT_PUBLIC_BASE_URL)
  const amount = BigNumber.from(quantity).mul(unitPrice)
  if (!maker?.email) return null
  return {
    to: maker.email,
    subject: `Your bid for ${quantity} edition${
      BigNumber.from(quantity).gt(1) ? 's' : ''
    } of ${asset.name} for ${formatUnits(unitPrice, currency.decimals)} ${
      currency.symbol
    }${
      BigNumber.from(quantity).gt(1) ? ' each' : ''
    } has met the expiration date`,
    html: `Hi <strong>${maker.username || maker.address}</strong>,<br/>
    <br/>
    Your bid for <strong>${quantity}</strong> edition${
      BigNumber.from(quantity).gt(1) ? 's' : ''
    } of the NFT <strong>${asset.name}</strong> for <strong>${formatUnits(
      amount,
      currency.decimals,
    )} ${currency.symbol}</strong>${
      BigNumber.from(quantity).gt(1) ? ' each' : ''
    } has met the expiration date. The bid has been canceled.<br/>
    <br/>
    You can place a new bid for this NFT at anytime. To do so just click the link below that will redirect you to it.<br/>
    <br/>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/tokens/${
      asset.id
    }">Place a new bid</a><br/>`,
  }
}
