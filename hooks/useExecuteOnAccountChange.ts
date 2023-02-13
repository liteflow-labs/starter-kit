import { useEffect, useRef } from 'react'
import useAccount from './useAccount'

// Hook to execute the `reloadFn` when the `address` from `useAccount` changes.
// TODO: check if this hook is still needed
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
