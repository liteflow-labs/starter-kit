import { Events, parseAndVerifyRequest } from '@nft/webhook'
import { NextApiRequest, NextApiResponse } from 'next'
import nodemailer, { SendMailOptions } from 'nodemailer'
import invariant from 'ts-invariant'
import AuctionBidCreated from '../../emails/AuctionBidCreated'
import BidCreated from '../../emails/BidCreated'

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

const emails = new Map<
  keyof Events,
  ((data: Events[keyof Events]) => SendMailOptions | null)[]
>([
  ['BID_CREATED', [(data) => BidCreated(data as Events['BID_CREATED'])]],
  [
    'AUCTION_BID_CREATED',
    [(data) => AuctionBidCreated(data as Events['AUCTION_BID_CREATED'])],
  ],
])

export default async function notification(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { data, type } = await parseAndVerifyRequest<
    'BID_CREATED' | 'AUCTION_BID_CREATED'
  >(req, liteflowSecret)
  const emailTemplates = emails.get(type)
  if (!emailTemplates)
    throw new Error(`Email template for event ${type} does not exist`)
  const emailsToSend = emailTemplates
    .map((template) => template(data))
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
