import { toAddress } from '@liteflow/core'
import { BigNumber } from '@ethersproject/bignumber'
import { useBalance as useWagmiBalance } from 'wagmi'

export default function useBalance(
  account: string | null | undefined,
  currencyId: string | null | undefined,
): [BigNumber | undefined, { loading: boolean }] {
  const [chainId, address] = (currencyId || '').split('-')
  const { data: balance, isLoading } = useWagmiBalance({
    enabled: !!currencyId && !!account,
    address: account ? toAddress(account) : undefined,
    chainId: Number(chainId),
    token: address ? toAddress(address) : undefined,
  })
  return [
    balance ? BigNumber.from(balance.value) : undefined,
    { loading: isLoading },
  ]
}
