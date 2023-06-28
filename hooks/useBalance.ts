import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { useBalance as useWagmiBalance } from 'wagmi'

export default function useBalance(
  account: string | null | undefined,
  currencyId: string | null | undefined,
): [BigNumber, { loading: boolean }] {
  const [chainId, address] = (currencyId || '').split('-')
  const { data: balance, isLoading } = useWagmiBalance({
    enabled: !!currencyId && !!account,
    address: account ? getAddress(account) : undefined,
    chainId: Number(chainId),
    token: address ? getAddress(address) : undefined,
  })
  return [
    balance ? BigNumber.from(balance.value) : BigNumber.from(0),
    { loading: isLoading },
  ]
}
