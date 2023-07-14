import { useAuthenticate, useIsLoggedIn } from '@liteflow/react'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import { useCallback, useMemo } from 'react'
import { useCookies } from 'react-cookie'
import { Connector, useAccount as useWagmiAccount, WalletClient } from 'wagmi'

type AccountDetail = {
  isLoggedIn: boolean
  isConnected: boolean
  address?: string
  jwtToken: string | null
  logout: () => Promise<void>
  login: (connector: Connector) => Promise<void>
}

export const COOKIE_JWT_TOKEN = 'jwt-token'
export type COOKIES = {
  [COOKIE_JWT_TOKEN]: string | undefined
}
const COOKIE_OPTIONS = {
  secure: true,
  sameSite: true,
  path: '/',
}

class Signer {
  constructor(public wallet: WalletClient) {}

  async getAddress() {
    return this.wallet.account.address
  }

  signMessage(message: string) {
    return this.wallet.signMessage({ message, account: this.wallet.account })
  }
}

export default function useAccount(): AccountDetail {
  const { isConnected, isReconnecting } = useWagmiAccount({
    // FIXME: Implements dummy onConnect and onDisconnect functions to prevent a bug only present with React 17 where other onConnect and onDisconnect in the same component (eg: AccountProvider) are not triggered if another useWagmiAccount doesn't implement those functions.
    // See https://github.com/liteflow-labs/starter-kit/pull/230#issuecomment-1477409307 for more info.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onConnect: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onDisconnect: () => {},
  })
  const [authenticate, { setAuthenticationToken, resetAuthenticationToken }] =
    useAuthenticate()
  const [cookies, setCookie, removeCookie] = useCookies<string, COOKIES>([
    COOKIE_JWT_TOKEN,
  ])

  const logout = useCallback(async () => {
    resetAuthenticationToken()
    removeCookie(COOKIE_JWT_TOKEN, COOKIE_OPTIONS)
  }, [resetAuthenticationToken, removeCookie])

  const jwt = useMemo(() => {
    const jwtToken = cookies[COOKIE_JWT_TOKEN]
    if (!jwtToken) return null
    const res = jwtDecode<JwtPayload & { address: string }>(jwtToken) // TODO: use `sub` instead of `address`?
    if (res.exp && res.exp < Math.ceil(Date.now() / 1000)) return null
    return { address: res.address.toLowerCase(), token: jwtToken }
  }, [cookies])

  let isLoggedIn = useIsLoggedIn(jwt?.address || '')

  // Reconnect based on the token and mark as logged in
  if (!isLoggedIn && isReconnecting && jwt) {
    setAuthenticationToken(jwt.token)
    isLoggedIn = true
  }

  const login = useCallback(
    async (connector: Connector) => {
      const wallet = await connector.getWalletClient()
      const signer = new Signer(wallet)
      const currentAddress = (await signer.getAddress()).toLowerCase()
      if (jwt && currentAddress === jwt.address) {
        return setAuthenticationToken(jwt.token)
      }
      const { jwtToken } = await authenticate(signer as any)

      const newJwt = jwtDecode<JwtPayload>(jwtToken)
      setCookie(COOKIE_JWT_TOKEN, jwtToken, {
        ...COOKIE_OPTIONS,
        ...(newJwt.exp
          ? {
              expires: new Date((newJwt.exp - 1) * 1000),
              maxAge: newJwt.exp - Math.ceil(Date.now() / 1000),
            }
          : {}),
      })
    },
    [jwt, authenticate, setAuthenticationToken, setCookie],
  )

  // Server side
  if (typeof window === 'undefined') {
    return {
      address: jwt?.address?.toLowerCase(),
      jwtToken: jwt?.token || null,
      isLoggedIn: !!jwt,
      isConnected: !!jwt,
      logout,
      login,
    }
  }

  return {
    address: isLoggedIn ? jwt?.address?.toLowerCase() : undefined,
    jwtToken: isLoggedIn ? jwt?.token || null : null,
    isLoggedIn,
    isConnected,
    logout,
    login,
  }
}
