import { useAuthenticate, useIsLoggedIn } from '@liteflow/react'
import { JwtPayload, jwtDecode } from 'jwt-decode'
import { useCallback, useEffect, useMemo } from 'react'
import { useCookies } from 'react-cookie'
import { Connector, useAccount as useWagmiAccount } from 'wagmi'
import { walletClientToSigner } from './useSigner'

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

export default function useAccount(): AccountDetail {
  const { isConnected, isReconnecting } = useWagmiAccount()
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

  const isLoggedInToAPI = useIsLoggedIn(jwt?.address || '')

  const isLoggedInWhileReconnect = useMemo(
    () => isReconnecting && !!jwt,
    [isReconnecting, jwt],
  )

  const isLoggedIn = useMemo(
    () => isLoggedInWhileReconnect || isLoggedInToAPI,
    [isLoggedInWhileReconnect, isLoggedInToAPI],
  )

  // Reconnect based on the token and mark as logged in
  useEffect(() => {
    if (isLoggedInToAPI) return
    if (!isReconnecting) return
    if (!jwt) return
    setAuthenticationToken(jwt.token)
  }, [isLoggedInToAPI, isReconnecting, jwt, setAuthenticationToken])

  const login = useCallback(
    async (connector: Connector) => {
      const wallet = await connector.getWalletClient()
      const signer = walletClientToSigner(wallet)
      const currentAddress = (await signer.getAddress()).toLowerCase()
      if (jwt && currentAddress === jwt.address) {
        return setAuthenticationToken(jwt.token)
      }
      const { jwtToken } = await authenticate(signer)

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
