import {
  AddressFilter,
  CurrencyFilter,
  IntFilter,
  useChainCurrenciesQuery,
} from '../graphql'

export default function useChainCurrencies(
  chainId?: number,
  { onlyERC20 }: { onlyERC20?: boolean } = {},
): ReturnType<typeof useChainCurrenciesQuery> {
  const filter = {
    chainId: { equalTo: chainId } as IntFilter,
  } as CurrencyFilter

  if (onlyERC20) filter['address'] = { isNull: false } as AddressFilter

  return useChainCurrenciesQuery({
    variables: { filter },
    skip: chainId === undefined,
  })
}
