import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'
import environment from './environment'

const isServer = typeof window === 'undefined'
const windowApolloState = !isServer && window.__NEXT_DATA__.apolloState

let _ssrClient: ApolloClient<NormalizedCacheObject>

export default function getClient(
  authorization: string | undefined,
  forceReset = false,
): ApolloClient<NormalizedCacheObject> {
  if (isServer && _ssrClient && !forceReset) return _ssrClient

  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    uri: environment.GRAPHQL_URL,
    headers: authorization ? { authorization: `Bearer ${authorization}` } : {},
    cache: new InMemoryCache({
      typePolicies: {
        Account: {
          keyFields: ['address'],
        },
      },
    }).restore(windowApolloState || {}),
    ssrMode: isServer,
  })
  if (isServer) _ssrClient = client

  return client
}
