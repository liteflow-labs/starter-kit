import { Spinner } from '@chakra-ui/react'
import { useBalance } from '@nft/hooks'
import { FC } from 'react'
import Price from '../../Price/Price'

const WalletBalance: FC<{
  account: string | undefined | null
  currency: {
    id: string
    decimals: number
    symbol: string
  }
}> = ({ account, currency }) => {
  const [balance, { loading }] = useBalance(account, currency.id)
  if (loading)
    return (
      <Spinner
        color="brand.500"
        mr={2}
        size="md"
        thickness="2px"
        speed="0.65s"
      />
    )
  return <Price amount={balance || 0} currency={currency} />
}

export default WalletBalance
