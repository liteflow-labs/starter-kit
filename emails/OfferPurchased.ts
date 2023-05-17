import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { Events } from '@nft/webhook'
import environment from '../environment'

export default function OfferPurchased({
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
  if (type !== 'SALE') return null
  if (!seller?.email) return null
  return {
    to: seller.email,
    subject: `You sold ${quantity} edition${
      BigNumber.from(quantity).gt(1) ? 's' : ''
    } of ${asset.name}`,
    html: `Hi <strong>${seller.username || seller.address}</strong>,<br/>
    <br/>
    We are pleased to let you know that you have sold <strong>${quantity}</strong> edition${
      BigNumber.from(quantity).gt(1) ? 's' : ''
    } of your NFT <strong>${asset.name}</strong> to <strong>${
      buyer?.username || buyer.address
    }</strong> for <strong>${formatUnits(unitPrice, currency.decimals)} ${
      currency.symbol
    }</strong>${BigNumber.from(quantity).gt(1) ? ' each' : ''}.<br/>
    <br/>      
    No additional actions are required on your side. The NFT ownership has been transferred and your wallet has been credited with the funds.<br/>
    <br/>
    <a href="${
      environment.BASE_URL
    }/account/wallet">Check my wallet balance</a>`,
  }
}
