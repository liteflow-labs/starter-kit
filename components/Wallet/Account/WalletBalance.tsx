import { Spinner } from '@chakra-ui/react'
import { FC } from 'react'
import useBalance from '../../../hooks/useBalance'
import Price from '../../Price/Price'

const WalletBalance: FC<{
  account: string | undefined | null
  currency: {
    id: string
    decimals: number
    symbol: string
  }
}> = ({ account, currency }) => {
  const [balance] = useBalance(account, currency.id)
  if (!balance)
    return (
      <Spinner
        color="brand.500"
        mr={2}
        size="md"
        thickness="2px"
        speed="0.65s"
      />
    )
  return <Price amount={balance} currency={currency} />
}

export default WalletBalance
