import request, { gql } from 'graphql-request'
import invariant from 'ts-invariant'

const query = gql`
  query Auction($id: UUID!, $now: Datetime!) {
    auction(id: $id) {
      expireAt
      offers(
        filter: {
          signature: { isNull: false }
          expiredAt: { greaterThan: $now }
          availableQuantity: { greaterThan: "0" }
        }
        orderBy: AMOUNT_DESC
        first: 1
      ) {
        nodes {
          amount
          makerAddress
          maker {
            address
            username
            email
          }
        }
      }
    }
  }
`

type Result = {
  expireAt: Date
  bestOffer: {
    amount: string
    maker: {
      address: string
      username?: string
      email?: string
    }
  } | null
}

export const fetchAdditionalAuctionData = async (
  auctionId: string,
  endAt: string,
): Promise<Result> => {
  invariant(process.env.NEXT_PUBLIC_GRAPHQL_URL)
  const { auction } = await request<{
    auction: {
      expireAt: string
      offers: {
        nodes: [
          {
            amount: string
            makerAddress: string
            maker?: {
              address: string
              username?: string
              email?: string
            }
          },
        ]
      }
    }
  }>(
    process.env.NEXT_PUBLIC_GRAPHQL_URL,
    query,
    {
      id: auctionId,
      now: new Date(endAt),
    },
    // TODO: fix this request as `email` cannot be fetched on the public API
    // and because of that emails to bid creators are not sent
    // {
    //   Authorization: `Bearer ${process.env.LITEFLOW_ADMIN_TOKEN}`,
    // },
  )

  const bestOffer = auction.offers.nodes[0]
  return {
    expireAt: new Date(auction.expireAt),
    bestOffer: bestOffer
      ? {
          ...bestOffer,
          maker: {
            ...bestOffer.maker,
            address: bestOffer.maker?.address || bestOffer.makerAddress,
          },
        }
      : null,
  }
}
