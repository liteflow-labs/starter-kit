import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { Events } from '@nft/webhook'
import environment from '../environment'
import { formatDate } from '../utils'

export default function BidCreated({
  asset,
  maker,
  taker,
  unitPrice,
  currency,
  quantity,
  expiredAt,
}: Events['BID_CREATED']): {
  html: string
  subject: string
  to: string
} | null {
  if (!taker?.email) return null
  return {
    to: taker.email,
    subject: `New bid received for ${quantity} edition${
      BigNumber.from(quantity).gt(1) ? 's' : ''
    } of ${asset.name} for ${formatUnits(unitPrice, currency.decimals)} ${
      currency.symbol
    }${BigNumber.from(quantity).gt(1) ? ' each' : ''}`,
    html: `Hi <strong>${taker.username || taker.address}</strong>,<br/>
    <br/>
    We are pleased to let you know that you have received a new bid from <strong>${
      maker.username || maker.address
    }</strong> for <strong>${quantity}</strong> edition${
      BigNumber.from(quantity).gt(1) ? 's' : ''
    } of your NFT <strong>${asset.name}</strong> for <strong>${formatUnits(
      unitPrice,
      currency.decimals,
    )} ${currency.symbol}</strong>${
      BigNumber.from(quantity).gt(1) ? ' each' : ''
    }.<br/>
    <br/>
    You have until the <strong>${formatDate(
      expiredAt,
    )}</strong> to accept it. After that the bid will be expired.<br/>
    <br/>      
    To do so just click the link below that will redirect you to it.<br/>
    <br/>
    <a href="${environment.BASE_URL}/tokens/${
      asset.id
    }">Go to the NFT page</a><br/>`,
  }
}
