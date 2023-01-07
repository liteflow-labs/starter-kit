import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'
import decode, { JwtPayload } from 'jwt-decode'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'

const COOKIE_JWT_TOKEN = 'jwt-token'

type UserProp = {
  address: string | null
  token: string | null
}

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

export type PropsWithUserAndState = {
  user: UserProp
  [APOLLO_STATE_PROP_NAME]: any
}

type GetServerSidePropsContextWithUser = GetServerSidePropsContext & {
  user: UserProp
}

function getClient(
  uri: string,
  jwt: string | undefined,
): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    uri: uri,
    headers: jwt ? { authorization: `Bearer ${jwt}` } : {},
    cache: new InMemoryCache({
      typePolicies: {
        Account: {
          keyFields: ['address'],
        },
      },
    }),
    ssrMode: true,
  })
}

export function wrapServerSideProps<T extends { [key: string]: unknown }>(
  url: string,
  handler: (
    context: GetServerSidePropsContextWithUser,
    client: ApolloClient<NormalizedCacheObject>,
  ) => Promise<GetServerSidePropsResult<T>>,
): (
  context: GetServerSidePropsContext,
) => Promise<GetServerSidePropsResult<T>> {
  return async (context) => {
    console.log('Function starts')
    const jwt = context.req.cookies[COOKIE_JWT_TOKEN]
    const client = getClient(url, jwt)
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
    const result = await handler(contextWithUser, client)
    console.log('Function ends')
    return wrapServerSidePropsResult<T>(contextWithUser, client, result)
  }
}

function wrapServerSidePropsResult<T extends { [key: string]: unknown }>(
  context: GetServerSidePropsContextWithUser,
  client: ApolloClient<NormalizedCacheObject>,
  pageProps: GetServerSidePropsResult<T>,
): GetServerSidePropsResult<T> {
  if (pageProps && 'props' in pageProps) {
    for (const [key, value] of Object.entries(pageProps.props)) {
      ;(pageProps.props as any)[key] = JSON.parse(JSON.stringify(value))
    }

    ;(pageProps.props as any)[APOLLO_STATE_PROP_NAME] = client.extract()
    ;(pageProps.props as any).user = context.user
  }

  return pageProps
}
