import { BigNumber } from '@ethersproject/bignumber'
import { BigNumber as BN } from 'bignumber.js'
import { useMemo } from 'react'

export default function useParseBigNumber(
  value: string | undefined,
  decimals = 0,
): BigNumber {
  return useMemo(() => {
    if (!value) return BigNumber.from(0)
    try {
      return BigNumber.from(new BN(value).shiftedBy(decimals).toFixed(0))
    } catch {
      console.error(`Cannot parse value ${value} as BigNumber`)
      return BigNumber.from(0)
    }
  }, [decimals, value])
}
