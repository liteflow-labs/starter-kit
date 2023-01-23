import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { parseAndVerifyRequest, Webhooks } from '@nft/webhook'
import { render } from '@react-email/render'
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
  const liteflowSecret = process.env.LITEFLOW_SECRET
  invariant(liteflowSecret, 'LITEFLOW_SECRET is required')

  const data = await parseAndVerifyRequest(req, liteflowSecret)
  const emails = email(data.type as keyof Webhooks, data.payload)

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
