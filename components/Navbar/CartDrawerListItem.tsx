import { Button, Text } from '@chakra-ui/react'
import { FC } from 'react'
import { Standard } from '../../graphql'
import Image from '../Image/Image'
import Link from '../Link/Link'
import { ListItem } from '../List/List'

type Props = {
  cartItem: {
    unitPrice: string
    availableQuantity: string
    asset: {
      id: string
      image: string
      name: string
      collection: {
        chainId: number
        address: string
        name: string
        standard: Standard
      }
    }
  }
}

const CartDrawerListItem: FC<Props> = ({ cartItem }) => {
  return (
    <ListItem
      image={
        <Link
          href={`/tokens/${cartItem.asset.collection.chainId}-${cartItem.asset.collection.address}-${cartItem.asset.id}`}
        >
          <Image
            src={cartItem.asset.image}
            alt={cartItem.asset.name}
            width={32}
            height={32}
            w={8}
            h={8}
            objectFit="cover"
          />
        </Link>
      }
      label={
        <Text
          as={Link}
          href={`/tokens/${cartItem.asset.collection.chainId}-${cartItem.asset.collection.address}-${cartItem.asset.id}`}
          variant="subtitle2"
          color="gray.800"
          title={cartItem.asset.collection.name}
        >
          {cartItem.asset.collection.name}
        </Text>
      }
      subtitle={
        <Text
          as={Link}
          href={`/collections/${cartItem.asset.collection.chainId}/${cartItem.asset.collection.address}`}
          title={cartItem.asset.collection.name}
          variant="caption"
        >
          {cartItem.asset.collection.name}
        </Text>
      }
      action={<Button>Clear</Button>}
    />
  )
}

export default CartDrawerListItem
