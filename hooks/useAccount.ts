import { Signer } from '@ethersproject/abstract-signer'
import { useAuthenticate, useIsLoggedIn } from '@nft/hooks'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import { useCallback, useMemo } from 'react'
import { useCookies } from 'react-cookie'
import { Connector, useAccount as useWagmiAccount } from 'wagmi'

type AccountDetail = {
  isLoggedIn: boolean
  isConnected: boolean
  address?: string
  jwtToken: string | null
  logout: () => Promise<void>
  login: (connector: Connector) => Promise<void>
}

export const COOKIE_JWT_TOKEN = 'jwt-token'
const COOKIE_OPTIONS = {
  secure: true,
  sameSite: true,
  path: '/',
}

export default function useAccount(): AccountDetail {
  const { address, isConnected } = useWagmiAccount()
  const [authenticate, { setAuthenticationToken, resetAuthenticationToken }] =
    useAuthenticate()
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_JWT_TOKEN])
  const isLoggedIn = useIsLoggedIn(address || '')

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

  const login = useCallback(
    async (connector: Connector<any, any, Signer>) => {
      const signer = await connector.getSigner()
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
      jwtToken: jwt?.token,
      isLoggedIn: !!jwt,
      isConnected: !!jwt,
      logout,
      login,
    }
  }

  return {
    address: isLoggedIn ? address?.toLowerCase() : undefined,
    jwtToken: isLoggedIn ? jwt?.token : null,
    isLoggedIn,
    isConnected,
    logout,
    login,
  }
}
