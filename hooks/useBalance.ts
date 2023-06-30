import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { useBalance as useWagmiBalance } from 'wagmi'

export default function useBalance(
  account: string | null | undefined,
  currencyId: string | null | undefined,
): [BigNumber, { loading: boolean }] {
  const [chainId, address] = (currencyId || '').split('-')
  // TODO: find better type definition instead of `0x${string}`
  const { data: balance, isLoading } = useWagmiBalance({
    enabled: !!currencyId && !!account,
    address: account ? (getAddress(account) as `0x${string}`) : undefined,
    chainId: Number(chainId),
    token: address ? (getAddress(address) as `0x${string}`) : undefined,
  })
  return [
    balance ? BigNumber.from(balance.value) : BigNumber.from(0),
    { loading: isLoading },
  ]
}
