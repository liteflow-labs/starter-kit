import { Events, parseAndVerifyRequest } from '@nft/webhook'
import { NextApiRequest, NextApiResponse } from 'next'
import nodemailer, { SendMailOptions } from 'nodemailer'
import invariant from 'ts-invariant'
import AuctionBidCreated from '../../emails/AuctionBidCreated'
import AuctionBidExpired from '../../emails/AuctionBidExpired'
import AuctionEndedNoBids from '../../emails/AuctionEndedNoBids'
import AuctionEndedReservePriceBuyer from '../../emails/AuctionEndedReservePriceBuyer'
import AuctionEndedReservePriceSeller from '../../emails/AuctionEndedReservePriceSeller'
import AuctionEndedWonBuyer from '../../emails/AuctionEndedWonBuyer'
import AuctionEndedWonSeller from '../../emails/AuctionEndedWonSeller'
import AuctionExpired from '../../emails/AuctionExpired'
import BidAccepted from '../../emails/BidAccepted'
import BidCreated from '../../emails/BidCreated'
import BidExpired from '../../emails/BidExpired'
import OfferExpired from '../../emails/OfferExpired'
import OfferPurchased from '../../emails/OfferPurchased'

invariant(process.env.EMAIL_HOST, 'env EMAIL_HOST is required')
invariant(process.env.EMAIL_PORT, 'env EMAIL_PORT is required')
invariant(process.env.EMAIL_USERNAME, 'env EMAIL_USERNAME is required')
invariant(process.env.EMAIL_PASSWORD, 'env EMAIL_PASSWORD is required')
invariant(
  process.env.LITEFLOW_WEBHOOK_SECRET,
  'env LITEFLOW_WEBHOOK_SECRET is required',
)
const liteflowSecret = process.env.LITEFLOW_WEBHOOK_SECRET

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const emails = new Map<keyof Events, ((data: any) => SendMailOptions | null)[]>(
  [
    ['AUCTION_BID_CREATED', [AuctionBidCreated]],
    ['BID_CREATED', [BidCreated]],
    ['OFFER_CREATED', []],
    ['BID_EXPIRED', [BidExpired]],
    ['OFFER_EXPIRED', [OfferExpired]],
    ['AUCTION_BID_EXPIRED', [AuctionBidExpired]],
    ['TRADE_CREATED', [BidAccepted, OfferPurchased]],
    [
      'AUCTION_ENDED',
      [
        AuctionEndedNoBids,
        AuctionEndedReservePriceBuyer,
        AuctionEndedReservePriceSeller,
        AuctionEndedWonBuyer,
        AuctionEndedWonSeller,
      ],
    ],
    ['AUCTION_EXPIRED', [AuctionExpired]],
  ],
)

export default async function notification(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { data, type } = await parseAndVerifyRequest(req, liteflowSecret)
  const emailTemplates = emails.get(type)
  if (!emailTemplates)
    throw new Error(`Email template for event ${type} does not exist`)
  await Promise.all(
    emailTemplates
      .map((template) => template(data))
      .filter(Boolean)
      .map((email) =>
        transporter.sendMail({
          ...email,
          from: process.env.EMAIL_FROM,
        }),
      ),
  )

  res.status(200).end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}
