import { Client } from 'pg'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function detect(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const domain = req.headers['x-forwarded-host'] || req.headers['host']
  console.log(req.headers)
  console.log(domain)
  const {
    rows: [metadata],
  } = await client.query<{ metadata: any }>(
    `SELECT * FROM organization."Organization" WHERE domain = $1;`,
    [domain],
  )
  res.status(200).send(metadata)
}
