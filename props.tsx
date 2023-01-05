import decode, { JwtPayload } from 'jwt-decode'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'

const COOKIE_JWT_TOKEN = 'jwt-token'

type UserProp = {
  address: string | null
  token: string | null
}

export type PropsWithUser = {
  user: UserProp
}

type GetServerSidePropsContextWithUser = GetServerSidePropsContext & {
  user: UserProp
}

export function wrapServerSideProps<T extends { [key: string]: unknown }>(
  _url: string,
  handler: (
    context: GetServerSidePropsContextWithUser,
  ) => Promise<GetServerSidePropsResult<T>>,
): (
  context: GetServerSidePropsContext,
) => Promise<GetServerSidePropsResult<T>> {
  return async (context) => {
    const jwt = context.req.cookies[COOKIE_JWT_TOKEN]
    const address = jwt
      ? decode<JwtPayload & { address: string }>(jwt).address
      : null
    const contextWithUser = {
      ...context,
      user: {
        address: address,
        token: jwt || null,
      },
    }
    const result = await handler(contextWithUser)
    if (result && 'props' in result) {
      for (const [key, value] of Object.entries(result.props)) {
        ;(result.props as any)[key] = JSON.parse(JSON.stringify(value))
      }
      ;(result.props as any).user = contextWithUser.user
    }

    return result
  }
}
