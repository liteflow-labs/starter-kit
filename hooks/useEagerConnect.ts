import { useEffect, useMemo, useState } from 'react'
import { useAccount as useWagmiAccount } from 'wagmi'
import useAccount from './useAccount'

export default function useEagerConnect(): boolean {
  const { isReconnecting } = useWagmiAccount()
  const { isConnected, isLoggedIn } = useAccount()
  const [hasBeenReady, setHasBeenReady] = useState(false)

  const ready = useMemo(() => {
    if (isReconnecting) return false
    if (!isConnected) return true
    if (!isLoggedIn) return false
    return true
  }, [isReconnecting, isConnected, isLoggedIn])

  useEffect(() => {
    if (ready) setHasBeenReady(true)
  }, [ready, setHasBeenReady])

  return hasBeenReady || ready
}
