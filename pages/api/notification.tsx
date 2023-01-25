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

const emails = new Map<
  keyof Webhooks,
  ((data: Webhooks[keyof Webhooks]) => SendMailOptions | null)[]
>([
  ['BID_CREATED', [BidCreated]],
  ['AUCTION_BID_CREATED', [AuctionBidCreated]],
])

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
  const emailTemplates = emails.get(type as keyof Webhooks)
  if (!emailTemplates) throw new Error("Email doesn't exist")
  const emailsToSend = emailTemplates
    .map((template) => template(data as Webhooks[keyof Webhooks]))
    .filter(Boolean)

  await Promise.all(
    emailsToSend.map((email) =>
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
