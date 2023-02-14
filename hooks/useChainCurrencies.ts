import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
  AddressFilter,
  ChainCurrenciesDocument,
  ChainCurrenciesQuery,
  ChainCurrenciesQueryVariables,
  CurrencyFilter,
  IntFilter,
  useChainCurrenciesQuery,
} from '../graphql'

function filter(
  chainId: number | undefined,
  { onlyERC20 }: { onlyERC20: boolean | undefined } = { onlyERC20: undefined },
) {
  const filter = {
    chainId: { equalTo: chainId } as IntFilter,
  } as CurrencyFilter
  if (onlyERC20) filter['address'] = { isNull: false } as AddressFilter
  return filter
}

export default function useChainCurrencies(
  chainId?: number,
  { onlyERC20 }: { onlyERC20?: boolean } = {},
): [
  NonNullable<ChainCurrenciesQuery['currencies']>['nodes'],
  { error: Error | undefined },
] {
  const { data, error } = useChainCurrenciesQuery({
    variables: { filter: filter(chainId, { onlyERC20 }) },
    skip: chainId === undefined,
  })

  return [data?.currencies?.nodes || [], { error }]
}

export async function prefetchChainCurrencies(
  client: ApolloClient<NormalizedCacheObject>,
  chainId: number,
  { onlyERC20 }: { onlyERC20?: boolean } = {},
): Promise<void> {
  const chainCurrency = await client.query<
    ChainCurrenciesQuery,
    ChainCurrenciesQueryVariables
  >({
    query: ChainCurrenciesDocument,
    variables: { filter: filter(chainId, { onlyERC20 }) },
  })
  if (chainCurrency.error) throw chainCurrency.error
}
