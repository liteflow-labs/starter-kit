import { BigNumber } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { useFeesLazyQuery } from '../graphql'

export default function useFees({
  chainId,
  collectionAddress,
  tokenId,
  currencyId,
  unitPrice,
  quantity,
  debounceTimeout = 500,
}: {
  chainId: number
  collectionAddress: string
  tokenId: string
  currencyId: string | undefined
  unitPrice: BigNumber
  quantity: BigNumber
  debounceTimeout?: number
}) {
  const [fetchFees, { data, previousData }] = useFeesLazyQuery({
    ssr: false,
  })
  const [loading, setLoading] = useState(false) // manual state to tell if the fetch is in progress. Cannot use the loading param from useFeesLazyQuery because of the debounce feature
  useEffect(() => {
    if (currencyId === undefined) return
    setLoading(true)
    const abortController = new AbortController()
    const debounce = setTimeout(async () => {
      try {
        await fetchFees({
          context: {
            fetchOptions: {
              signal: abortController.signal,
            },
          },
          variables: {
            chainId,
            collectionAddress,
            tokenId,
            currencyId,
            quantity: quantity.toString(),
            unitPrice: unitPrice.toString(),
          },
        })
      } finally {
        setLoading(false)
      }
    }, debounceTimeout)
    return () => {
      abortController.abort()
      clearTimeout(debounce)
      setLoading(false)
    }
  }, [
    chainId,
    collectionAddress,
    currencyId,
    debounceTimeout,
    fetchFees,
    unitPrice,
    quantity,
    tokenId,
  ])

  const feesPerTenThousand = useMemo(
    () => (data?.orderFees || previousData?.orderFees)?.valuePerTenThousand,
    [data?.orderFees, previousData?.orderFees],
  )

  return {
    feesPerTenThousand,
    loading,
  }
}
