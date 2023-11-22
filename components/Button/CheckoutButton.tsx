import { Button, ButtonGroup, ButtonProps, Divider } from '@chakra-ui/react'
import { JSX, PropsWithChildren, useMemo } from 'react'
import useAccount from '../../hooks/useAccount'
import { isSameAddress } from '../../utils'
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

  const isDisabled = useMemo(
    () => (address ? isSameAddress(address, offer.maker.address) : false),
    [address, offer.maker],
  )

  return (
    <ButtonGroup isAttached width="full" isDisabled={isDisabled}>
      <Button
        {...props}
        width="full"
        as={Link}
        isDisabled={isDisabled}
        href={isDisabled ? '#' : `/checkout/${offer.id}`}
        borderRightRadius={address ? 0 : undefined}
      >
        {children}
      </Button>
      {address && (
        <>
          <Divider width="1px" />
          <AddToCartButton
            {...props}
            borderLeftRadius={0}
            offerId={offer.id}
            isDisabled={isDisabled}
          />
        </>
      )}
    </ButtonGroup>
  )
}
