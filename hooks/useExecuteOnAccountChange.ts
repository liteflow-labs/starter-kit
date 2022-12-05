import { useWeb3React } from '@web3-react/core'
import { useEffect, useRef } from 'react'

// Hook to execute the `reloadFn` when the `account` from `useSession` changes.
export default function useExecuteOnAccountChange(
  reloadFn: () => any,
  ready: boolean,
): void {
  const { account } = useWeb3React()
  const ref = useRef(true)
  useEffect(() => {
    if (!ready) return
    if (ref.current) {
      ref.current = false
      return
    }
    void reloadFn()
  }, [reloadFn, account, ready])
}
