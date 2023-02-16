import { useMemo } from 'react'
import { chains } from '../connectors'

export type BlockExplorer = {
  name: string
  token: (address: string, id: string) => string
  address: (address: string) => string
  transaction: (hash: string | undefined) => string | null
}

export function blockExplorer(chainId: number | undefined): BlockExplorer {
  const explorer = chainId
    ? chains.find((chain) => chain.id === chainId)?.blockExplorers?.[
        'etherscan'
      ]
    : null

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
  return useMemo(() => blockExplorer(chainId), [chainId])
}
