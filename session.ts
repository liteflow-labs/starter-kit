import decode, { JwtPayload } from 'jwt-decode'

export const COOKIE_JWT_TOKEN = 'jwt-token'
export const COOKIE_OPTIONS = {
  secure: true,
  sameSite: true,
  path: '/',
}

export const currentJWT = (cookies: {
  [key: string]: string
}): null | { address: string; jwt: string } => {
  const jwtToken = cookies[COOKIE_JWT_TOKEN]
  if (!jwtToken) return null
  const res = decode<JwtPayload & { address: string }>(jwtToken) // TODO: use `sub` instead of `address`?
  if (res.exp && res.exp < Math.ceil(Date.now() / 1000)) return null
  return { address: res.address.toLowerCase(), jwt: jwtToken }
}

export const currentAccount = (cookies: {
  [key: string]: string
}): string | null => {
  const res = currentJWT(cookies)
  if (!res) return null
  return res.address
}

export const jwtValidity = (
  jwtToken: string,
): { expires: Date; maxAge: number } | null => {
  // decode jwt token to extract expire date
  // minus 1sec to the expiration to be sure
  const jwt = decode<JwtPayload>(jwtToken)
  if (!jwt.exp) return null
  return {
    expires: new Date((jwt.exp - 1) * 1000),
    maxAge: jwt.exp - Math.ceil(Date.now() / 1000),
  }
}
