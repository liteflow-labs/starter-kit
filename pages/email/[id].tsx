import { useRouter } from 'next/router'
import { useMemo } from 'react'
import AuctionBidCreated from '../../emails/AuctionBidCreated'
import BidCreated from '../../emails/BidCreated'

const asset = {
  name: 'Default asset',
  id: 'default-asset',
}
const account1 = {
  username: 'account1',
  address: '0xB5a15932Be6caEeF5d21AC704300bd45e10ff92d',
  email: '0xB5a15932Be6caEeF5d21AC704300bd45e10ff92d@email.eth',
}
const account2 = {
  username: 'account2',
  address: '0x4b595014f7b45789c3f4E79324aE6D8090A6C8B5',
  email: '0x4b595014f7b45789c3f4E79324aE6D8090A6C8B5@email.eth',
}
const unitPrice = {
  amount: Number(1_000_000_000_000_000_000).toString(),
  currency: {
    decimals: 18,
    symbol: 'ETH',
  },
}
const offer = {
  id: 'offer-id',
  asset,
  unitPrice,
  quantity: '1',
  maker: account1,
  taker: account2,
  timestamp: new Date(),
  expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
}

export default function Email(): JSX.Element {
  const {
    query: { id },
  } = useRouter()

  return useMemo(() => {
    switch (id) {
      case 'bid-created':
        return <BidCreated {...offer} />
      case 'auction-bid-created':
        return <AuctionBidCreated {...offer} />
      default:
        return <div>Not found</div>
    }
  }, [id])
}
