import { BigNumber } from '@ethersproject/bignumber'
import { toAddress } from '@liteflow/core'
import { useBalance as useWagmiBalance } from 'wagmi'

export default function useBalance(
  account: string | null | undefined,
  currencyId: string | null | undefined,
): [BigNumber | undefined] {
  const [chainId, address] = (currencyId || '').split('-')
  const { data: balance } = useWagmiBalance({
    enabled: !!currencyId && !!account,
    address: account ? toAddress(account) : undefined,
    chainId: Number(chainId),
    token: address ? toAddress(address) : undefined,
  })
  return [balance ? BigNumber.from(balance.value) : undefined]
}
