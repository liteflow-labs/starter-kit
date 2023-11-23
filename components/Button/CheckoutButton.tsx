import { Button, ButtonGroup, ButtonProps, Divider } from '@chakra-ui/react'
import { JSX, PropsWithChildren } from 'react'
import useAccount from '../../hooks/useAccount'
import Link from '../Link/Link'
import AddToCartButton from './AddToCart'

type Props = Omit<ButtonProps, 'href'> & {
  offer: {
    id: string
    maker: { address: string }
  }
}

export default function CheckoutButton({
  offer,
  children,
  ...props
}: PropsWithChildren<Props>): JSX.Element {
  const { address } = useAccount()

  return (
    <ButtonGroup isAttached width="full">
      <Button
        {...props}
        width="full"
        as={Link}
        href={`/checkout/${offer.id}`}
        borderRightRadius={address ? 0 : undefined}
      >
        {children}
      </Button>
      {address && (
        <>
          <Divider orientation="vertical" />
          <AddToCartButton {...props} borderLeftRadius={0} offerId={offer.id} />
        </>
      )}
    </ButtonGroup>
  )
}
