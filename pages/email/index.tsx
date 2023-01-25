import { List, ListItem } from '@chakra-ui/react'
import Link from 'components/Link/Link'
import SmallLayout from 'layouts/small'

export default function Emails(): JSX.Element {
  const emails = [
    {
      id: 'bid-created',
      name: 'Bid Created',
    },
    {
      id: 'auction-bid-created',
      name: 'Auction Bid Created',
    },
  ]

  return (
    <SmallLayout>
      <List orientation="horizontal">
        {emails.map((x, i) => (
          <ListItem key={i}>
            <Link href={`/email/${x.id}`}>{x.name}</Link>
          </ListItem>
        ))}
      </List>
    </SmallLayout>
  )
}
