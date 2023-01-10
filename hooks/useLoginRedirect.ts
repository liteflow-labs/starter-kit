import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { UrlObject } from 'url'
import { useAccount } from 'wagmi'

/**
 * Hook redirecting a user to a login page when they are not logged in with their wallet
 * @param url -- url to redirect the user to when they are not logged in
 */
export default function useLoginRedirect(
  ready: boolean,
  url?: UrlObject,
): void {
  const { replace, asPath } = useRouter()
  const { isConnected } = useAccount()

  useEffect(() => {
    if (!ready) return
    if (isConnected) return
    void replace({
      ...(url || { pathname: '/login' }),
      query: { redirectTo: asPath },
    })
  }, [isConnected, url, replace, asPath, ready])
}
