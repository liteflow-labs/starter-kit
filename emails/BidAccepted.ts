import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { Events } from '@nft/webhook'
import environment from '../environment'

export default function BidAccepted({
  unitPrice,
  currency,
  quantity,
  buyer,
  seller,
  offer: { asset, type },
}: Events['TRADE_CREATED']): {
  html: string
  subject: string
  to: string
} | null {
  if (type !== 'BUY') return null
  if (!buyer?.email) return null
  return {
    to: buyer.email,
    subject: `Your bid for ${quantity} edition${
      BigNumber.from(quantity).gt(1) ? 's' : ''
    } of ${asset.name} for ${formatUnits(unitPrice, currency.decimals)} ${
      currency.symbol
    }${BigNumber.from(quantity).gt(1) ? ' each' : ''} has been accepted`,
    html: `Hi <strong>${buyer.username || buyer.address}</strong>,<br/>
    <br/>
    We are pleased to let you know that your bid for <strong>${quantity}</strong> edition${
      BigNumber.from(quantity).gt(1) ? 's' : ''
    } of the NFT <strong>${asset.name}</strong> for <strong>${formatUnits(
      unitPrice,
      currency.decimals,
    )} ${currency.symbol}</strong>${
      BigNumber.from(quantity).gt(1) ? ' each' : ''
    } has been accepted by <strong>${
      seller.username || seller.address
    }</strong>.<br/>
    <br/>      
    The NFT ownership has been transferred. No additional actions are required on your side.<br/>
    <br/>
    <a href="${environment.BASE_URL}/tokens/${asset.id}">View my NFT</a><br/>`,
  }
}
