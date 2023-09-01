import { useMemo } from 'react'
import { Chain } from 'wagmi'
import useEnvironment from './useEnvironment'

export type BlockExplorer = {
  name: string
  token: (address: string, id: string) => string
  address: (address: string) => string
  transaction: (hash: string | undefined) => string | null
}

export function blockExplorer(
  chains: Chain[],
  chainId: number | undefined,
): BlockExplorer {
  const chain = chains.find((chain) => chain.id === chainId)
  const explorer =
    chain?.blockExplorers?.['etherscan'] || chain?.blockExplorers?.default

  return {
    name: explorer?.name || '',
    token: (address: string, id: string) =>
      `${explorer?.url}/token/${address}?a=${id}`,
    address: (address: string) => `${explorer?.url}/address/${address}`,
    transaction: (hash: string | undefined) =>
      hash ? `${explorer?.url}/tx/${hash}` : null,
  }
}

export default function useBlockExplorer(
  chainId: number | undefined,
): BlockExplorer {
  const { CHAINS } = useEnvironment()
  return useMemo(() => blockExplorer(CHAINS, chainId), [CHAINS, chainId])
}
