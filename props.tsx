import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import environment from 'environment'
import decode, { JwtPayload } from 'jwt-decode'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { NextApiRequestCookies } from 'next/dist/server/api-utils'
import Cookies from 'universal-cookie'

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
  ssrMode: boolean,
  cookies: NextApiRequestCookies | undefined,
): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri,
  })

  // this function is called every time apollo is making a request
  const authLink = setContext((_, context) => {
    const c = new Cookies(cookies)

    const jwtToken = c.get(COOKIE_JWT_TOKEN)
    if (!jwtToken) return context

    // check expiration of jwt token
    const res = decode<JwtPayload>(jwtToken)
    if (res.exp && res.exp < Math.ceil(Date.now() / 1000)) return context

    return {
      ...context,
      headers: {
        ...context.headers,
        authorization: 'Bearer ' + jwtToken,
      },
    }
  })

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        Account: {
          keyFields: ['address'],
        },
      },
    }),
    ssrMode,
  })
}

function getContentfulClient(): ApolloClient<NormalizedCacheObject> {
  const httpLink = createHttpLink({
    uri: `https://graphql.contentful.com/content/v1/spaces/${environment.CONTENTFUL_SPACE_ID}/environments/${environment.CONTENTFUL_ENVIRONMENT_ID}`,
    headers: {
      authorization: `Bearer ${environment.CONTENTFUL_ACCESS_TOKEN}`,
      'Content-Language': 'en-us',
    },
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    ssrMode: true,
  })
}

export function wrapServerSideProps<T extends { [key: string]: unknown }>(
  url: string,
  handler: (
    context: GetServerSidePropsContextWithUser,
    client: ApolloClient<NormalizedCacheObject>,
    contentfulClient?: ApolloClient<NormalizedCacheObject>,
  ) => Promise<GetServerSidePropsResult<T>>,
): (
  context: GetServerSidePropsContext,
) => Promise<GetServerSidePropsResult<T>> {
  return async (context) => {
    const client = getClient(url, true, context.req.cookies)
    const contentfulClient = getContentfulClient()
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
    const result = await handler(contextWithUser, client, contentfulClient)
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
