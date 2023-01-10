import { Signer, TypedDataSigner } from '@ethersproject/abstract-signer'
import { useSigner as useBaseSigner } from 'wagmi'

/**
 * Hook returning the current signer logged in to the website. This signer can and should
 * be used to sign messages or transactions
 * @returns (Signer & TypedDataSigner) | undefined
 */
export default function useSigner(): (Signer & TypedDataSigner) | undefined {
  const { data } = useBaseSigner()
  return (data || undefined) as (Signer & TypedDataSigner) | undefined
}
