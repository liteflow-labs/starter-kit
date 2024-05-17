import { Signer } from '@liteflow/core'
import { useMemo } from 'react'
import { publicActions } from 'viem'
import { WalletClient, useWalletClient } from 'wagmi'
import useAccount from './useAccount'

/**
 * Hook returning the current signer logged in to the website. This signer can and should
 * be used to sign messages or transactions
 */

export function walletClientToSigner(walletClient: WalletClient): Signer {
  return walletClient?.extend(publicActions)
}

export default function useSigner(): Signer | undefined {
  const { data: walletClient } = useWalletClient()
  const { isLoggedIn } = useAccount()

  return useMemo(() => {
    if (!isLoggedIn) return
    if (!walletClient) return
    return walletClientToSigner(walletClient)
  }, [isLoggedIn, walletClient])
}
