import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'
import environment from './environment'

const isServer = typeof window === 'undefined'
const windowApolloState = !isServer && window.__NEXT_DATA__.props.apolloState

let _client: ApolloClient<NormalizedCacheObject>

export default function getClient(
  authorization: string | null,
  forceReset = false,
): ApolloClient<NormalizedCacheObject> {
  if (_client && !forceReset) return _client

  _client = new ApolloClient({
    uri: environment.GRAPHQL_URL,
    headers: authorization ? { authorization: `Bearer ${authorization}` } : {},
    cache: new InMemoryCache({
      typePolicies: {
        Account: {
          keyFields: ['address'],
        },
        Collection: {
          keyFields: ['chainId', 'address'],
        },
      },
    }).restore(windowApolloState || {}),
    ssrMode: isServer,
  })
  return _client
}
