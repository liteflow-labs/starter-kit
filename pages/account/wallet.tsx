import { Account, WalletAccount } from '@nft/components'
import { useWeb3React } from '@web3-react/core'
import { NextPage } from 'next'
import { useMemo } from 'react'
import Head from '../../components/Head'
import environment from '../../environment'
import {
  useWalletCurrenciesQuery,
  WalletCurrenciesDocument,
  WalletCurrenciesQuery,
} from '../../graphql'
import useEagerConnect from '../../hooks/useEagerConnect'
import useLoginRedirect from '../../hooks/useLoginRedirect'
import SmallLayout from '../../layouts/small'
import { wrapServerSideProps } from '../../props'

export const getServerSideProps = wrapServerSideProps(
  environment.GRAPHQL_URL,
  async (_, client) => {
    const { data, error } = await client.query<WalletCurrenciesQuery>({
      query: WalletCurrenciesDocument,
    })
    if (error) throw error
    if (!data.currencies?.nodes) return { notFound: true }
    return {
      props: {},
    }
  },
)

const WalletPage: NextPage = () => {
  const ready = useEagerConnect()
  const { account } = useWeb3React()
  useLoginRedirect(ready)
  const { data } = useWalletCurrenciesQuery()
  const currencies = useMemo(() => data?.currencies?.nodes, [data])

  if (!currencies) return <></>
  if (!account) return <></>
  return (
    <SmallLayout>
      <Head title="Account - Wallet" />
      <Account currentTab="wallet">
        <WalletAccount
          account={account.toLowerCase()}
          currencies={currencies}
          networkName={environment.NETWORK_NAME}
        />
      </Account>
    </SmallLayout>
  )
}

export default WalletPage
