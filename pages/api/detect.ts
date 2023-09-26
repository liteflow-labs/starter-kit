import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'
import invariant from 'ts-invariant'

invariant(process.env.DATABASE_URL, 'Env DATABASE_URL is missing')
const client = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // default
  application_name: 'demo',
  allowExitOnIdle: true, // don't wait for connections to close, perfect for serverless functions
})

export default async function detect(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const domain = req.headers['x-forwarded-host'] || req.headers['host']
  const {
    rows: [organization],
  } = await client.query<{
    id: string
    name: string
    domain: string
    maxRoyaltiesPerTenThousand: number
    offerValiditySeconds: number
    offerAuctionDeltaSeconds: number
    hasLazyMint: boolean
    hasUnlockableContent: boolean
    metadata: any
  }>(
    `SELECT id, name, domain, "maxRoyaltiesPerTenThousand", "offerValiditySeconds", "offerAuctionDeltaSeconds", "hasLazyMint", "hasUnlockableContent", metadata 
      FROM organization."Organization" 
      WHERE domain = $1 LIMIT 1;`,
    [domain],
  )
  if (!organization) return res.json({})
  res.json({
    metadata: organization.metadata || {},
    id: organization.id,
    domain: organization.domain,
    maxRoyaltiesPerTenThousand: organization.maxRoyaltiesPerTenThousand,
    offerValiditySeconds: organization.offerValiditySeconds,
    offerAuctionDeltaSeconds: organization.offerAuctionDeltaSeconds,
    hasLazyMint: organization.hasLazyMint,
    hasUnlockableContent: organization.hasUnlockableContent,
  })
}
