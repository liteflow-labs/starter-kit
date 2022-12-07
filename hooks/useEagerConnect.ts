import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { isMobile } from 'react-device-detect'
import connectors from '../connectors'
import { currentAccount } from '../session'

export default function useEagerConnect(): boolean {
  const [cookies] = useCookies()
  const connectedAddress = currentAccount(cookies)
  const { activate, active } = useWeb3React() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false)

  const initialize = useCallback(async () => {
    if (connectors.injected) {
      try {
        const isAuthorized = await connectors.injected.isAuthorized()
        if (isAuthorized) {
          const address = await connectors.injected.getAccount()
          if (address?.toLowerCase() === connectedAddress?.toLowerCase()) {
            void activate(connectors.injected, undefined, true)
            return
          }
        }

        if (isMobile && window.ethereum) {
          void activate(connectors.injected, undefined, true)
          return
        }
      } catch (e) {
        console.error('Failed to activate injected connector', e)
      }
    }
    if (connectors.email) {
      try {
        const user = await connectors.email.loggedInUser()
        const address = await connectors.email.getAccount()
        if (
          user &&
          user.email &&
          address?.toLowerCase() === connectedAddress?.toLowerCase()
        ) {
          void activate(connectors.email.withEmail(user.email), undefined, true)
          return
        }
      } catch (e) {
        console.error('Failed to activate email connector', e)
      }
    }
    setTried(true)
  }, [activate, connectedAddress])

  useEffect(() => {
    if (active) return
    void initialize()
  }, [initialize]) /* eslint-disable-line react-hooks/exhaustive-deps */ // we don't need to re-run this on every update of the active connection, only when the initialized changes (and so the connectors)

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}
