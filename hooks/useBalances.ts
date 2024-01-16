import { BigNumber } from '@ethersproject/bignumber'
import { fetchBalance } from '@wagmi/core'
import { useCallback, useEffect, useState } from 'react'

type Balances = { [currencyId: string]: BigNumber }

export default function useBalances(
  account: string | null | undefined,
  currencyIds: string[],
): [Balances, { loading: boolean }] {
  const [loading, setLoading] = useState(true)
  const [balances, setBalances] = useState<Balances>({})

  const fetchAllBalances = useCallback(async () => {
    setLoading(true)
    try {
      const result = await Promise.all(
        currencyIds.map((x) =>
          fetchBalance({
            address: account as `0x${string}`,
            chainId: Number(x.split('-')[0]),
            token: x.split('-')[1]
              ? (x.split('-')[1] as `0x${string}`)
              : undefined,
          }),
        ),
      )
      setBalances(
        result.reduce(
          (acc, x, i) => ({
            ...acc,
            [currencyIds[i] || '']: BigNumber.from(x.value),
          }),
          {} as Balances,
        ),
      )
    } finally {
      setLoading(false)
    }
  }, [currencyIds, account])

  useEffect(() => {
    void fetchAllBalances()
  }, [fetchAllBalances])

  return [balances, { loading }]
}
