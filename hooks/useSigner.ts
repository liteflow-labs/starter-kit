import { Signer, TypedDataSigner } from '@ethersproject/abstract-signer'
import { ExternalProvider } from '@ethersproject/providers'
import { providers } from 'ethers'
import { useMemo } from 'react'
import type { WalletClient } from 'wagmi'
import { useWalletClient } from 'wagmi'
import useAccount from './useAccount'

/**
 * Hook returning the current signer logged in to the website. This signer can and should
 * be used to sign messages or transactions
 * @returns (Signer & TypedDataSigner) | undefined
 */

export function walletClientToSigner(
  walletClient: WalletClient,
): providers.JsonRpcSigner {
  const { account, transport } = walletClient
  const provider = new providers.Web3Provider(transport as ExternalProvider)
  const signer = provider.getSigner(account.address)
  return signer
}

export default function useSigner(): (Signer & TypedDataSigner) | undefined {
  const { data: walletClient } = useWalletClient()
  const { isLoggedIn } = useAccount()

  return useMemo(() => {
    if (!isLoggedIn) return
    if (!walletClient) return
    return walletClientToSigner(walletClient)
  }, [isLoggedIn, walletClient])
}
