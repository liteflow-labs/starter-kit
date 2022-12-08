import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { UrlObject } from 'url'

/**
 * Hook redirecting a user to a login page when they are not logged in with their wallet
 * @param url -- url to redirect the user to when they are not logged in
 */
export default function useLoginRedirect(
  ready: boolean,
  url?: UrlObject,
): void {
  const { replace, asPath } = useRouter()
  const { account } = useWeb3React()

  useEffect(() => {
    if (!ready) return
    if (account) return
    void replace({
      ...(url || { pathname: '/login' }),
      query: { redirectTo: asPath },
    })
  }, [account, url, replace, asPath, ready])
}
