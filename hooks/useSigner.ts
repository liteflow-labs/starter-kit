import { Signer, TypedDataSigner } from '@ethersproject/abstract-signer'
import { useMemo } from 'react'
import { useSigner as useOriginalSigner } from 'wagmi'
import useAccount from './useAccount'

/**
 * Hook returning the current signer logged in to the website. This signer can and should
 * be used to sign messages or transactions
 * @returns (Signer & TypedDataSigner) | undefined
 */
export default function useSigner(): (Signer & TypedDataSigner) | undefined {
  const { data } = useOriginalSigner()
  const { isLoggedIn } = useAccount()

  return useMemo(() => {
    if (!isLoggedIn) return
    if (!data) return
    return (data as Signer & TypedDataSigner) || undefined
  }, [isLoggedIn, data])
}
