import { useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'

// Hook to execute the `reloadFn` when the `account` from `useSession` changes.
export default function useExecuteOnAccountChange(
  reloadFn: () => any,
  ready: boolean,
): void {
  const { address } = useAccount()
  const ref = useRef(true)
  useEffect(() => {
    if (!ready) return
    if (ref.current) {
      ref.current = false
      return
    }
    void reloadFn()
  }, [reloadFn, address, ready])
}
