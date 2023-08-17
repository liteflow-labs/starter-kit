import { Client } from 'pg'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function detect(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
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
    ...(organization.metadata || {}),
    LITEFLOW_API_KEY: organization.id,
    META_TITLE: organization.name,
    BASE_URL: organization.domain,
    MAX_ROYALTIES: organization.maxRoyaltiesPerTenThousand / 100,
    OFFER_VALIDITY_IN_SECONDS: organization.offerValiditySeconds,
    AUCTION_VALIDITY_IN_SECONDS: organization.offerAuctionDeltaSeconds,
    LAZYMINT: organization.hasLazyMint,
    UNLOCKABLE_CONTENT: organization.hasUnlockableContent,
  })
}
