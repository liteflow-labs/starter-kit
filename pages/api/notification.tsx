import { parseAndVerifyRequest, Webhooks } from '@nft/webhook'
import { NextApiRequest, NextApiResponse } from 'next'
import nodemailer, { SendMailOptions } from 'nodemailer'
import invariant from 'ts-invariant'
import AuctionBidCreated from '../../emails/AuctionBidCreated'
import BidCreated from '../../emails/BidCreated'

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.EMAIL_PASSWORD,
  },
})

const email = <T extends keyof Webhooks>(
  type: T,
  data: Webhooks[T],
): SendMailOptions[] => {
  if (type === 'BID_CREATED') {
    const email = BidCreated(data as Webhooks['BID_CREATED'])
    return email ? [email] : []
  }
  if (type === 'AUCTION_BID_CREATED') {
    const email = AuctionBidCreated(data as Webhooks['AUCTION_BID_CREATED'])
    return email ? [email] : []
  }
  throw new Error("Email doesn't exist")
}

export default async function notification(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (!process.env.EMAIL_PASSWORD) {
    res.status(200).end()
    return
  }
  const liteflowSecret = process.env.LITEFLOW_WEBHOOK_SECRET
  invariant(liteflowSecret, 'LITEFLOW_WEBHOOK_SECRET is required')

  const { data, type } = await parseAndVerifyRequest(req, liteflowSecret)
  const emails = email(type as keyof Webhooks, data as Webhooks[keyof Webhooks])

  await Promise.all(
    emails.map((email) =>
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
