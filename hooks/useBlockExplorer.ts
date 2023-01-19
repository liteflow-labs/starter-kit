import { useCallback } from 'react'

export type BlockExplorer = {
  name: string
  token: (address: string, id: string) => string
  address: (address: string) => string
  transaction: (hash: string | undefined) => string | null
}

export default function useBlockExplorer(
  name: string,
  url: string,
): BlockExplorer {
  const token = useCallback(
    (address: string, id: string) => `${url}/token/${address}?a=${id}`,
    [url],
  )

  const transaction = useCallback(
    (hash: string | undefined) => (hash ? `${url}/tx/${hash}` : null),
    [url],
  )

  const address = useCallback(
    (address: string) => `${url}/address/${address}`,
    [url],
  )

  return { name, token, transaction, address }
}
