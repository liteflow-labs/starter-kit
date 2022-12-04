import { Signer, TypedDataSigner } from '@ethersproject/abstract-signer'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

/**
 * Hook returning the current signer logged in to the website. This signer can and should
 * be used to sign messages or transactions
 * @returns (Signer & TypedDataSigner) | undefined
 */
export default function useSigner(): (Signer & TypedDataSigner) | undefined {
  const { library, account } = useWeb3React()

  return useMemo(() => {
    if (!library) return
    if (!account) return
    return library.getSigner(account)
  }, [library, account])
}
