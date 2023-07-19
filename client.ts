import {
  ApolloClient,
  from,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { Router } from 'next/router'
import environment from './environment'

const isServer = typeof window === 'undefined'
const windowApolloState = !isServer && window.__NEXT_DATA__.props.apolloState

let _client: ApolloClient<NormalizedCacheObject>

export default function getClient(
  authorization: string | null,
  forceReset = false,
  push: Router['push'],
): ApolloClient<NormalizedCacheObject> {
  const errorLink = onError(({ graphQLErrors, networkError, response }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      )
    if (networkError) {
      void push('500')
      return console.log(`[Network error]: ${networkError}`)
    }
    // Only notify the user if absolutely no data came back
    if (!response || !response.data) {
      void push('404')
    }
  })

  const httpLink = new HttpLink({
    uri: `${
      process.env.NEXT_PUBLIC_LITEFLOW_BASE_URL || 'https://api.liteflow.com'
    }/${environment.LITEFLOW_API_KEY}/graphql`,
  })

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
    link: from([errorLink, httpLink]),
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
