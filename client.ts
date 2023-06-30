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
    uri: `${
      process.env.NEXT_PUBLIC_LITEFLOW_BASE_URL || 'https://api.liteflow.com'
    }/${environment.LITEFLOW_API_KEY}/graphql`,
    headers: {
      ...(authorization ? { authorization: `Bearer ${authorization}` } : {}),
      origin: environment.BASE_URL,
    },
    cache: new InMemoryCache({
      typePolicies: {
        Account: {
          keyFields: ['address'],
        },
        Asset: {
          keyFields: ['chainId', 'collectionAddress', 'tokenId'],
        },
        Collection: {
          keyFields: ['chainId', 'address'],
        },
      },
    }).restore(windowApolloState || {}),
    ssrMode: isServer,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
    ssrForceFetchDelay: 100,
  })
  return _client
}
