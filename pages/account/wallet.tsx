import { NextPage } from 'next'
import { useMemo } from 'react'
import AccountTemplate from '../../components/Account/Account'
import Head from '../../components/Head'
import WalletAccount from '../../components/Wallet/Account/Wallet'
import environment from '../../environment'
import {
  useWalletCurrenciesQuery,
  WalletCurrenciesDocument,
  WalletCurrenciesQuery,
} from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useEagerConnect from '../../hooks/useEagerConnect'
import useLoginRedirect from '../../hooks/useLoginRedirect'
import SmallLayout from '../../layouts/small'
import { wrapServerSideProps } from '../../props'

export const getServerSideProps = wrapServerSideProps(
  environment.GRAPHQL_URL,
  async (_, client) => {
    const { error } = await client.query<WalletCurrenciesQuery>({
      query: WalletCurrenciesDocument,
    })
    if (error) throw error
    return {
      props: {},
    }
  },
)

const WalletPage: NextPage = () => {
  const ready = useEagerConnect()
  const { address } = useAccount()
  useLoginRedirect(ready)
  const { data } = useWalletCurrenciesQuery()
  const currencies = useMemo(() => data?.currencies?.nodes, [data])

  if (!currencies) return <></>
  if (!address) return <></>
  return (
    <SmallLayout>
      <Head title="Account - Wallet" />
      <AccountTemplate currentTab="wallet">
        <WalletAccount account={address} currencies={currencies} />
      </AccountTemplate>
    </SmallLayout>
  )
}

export default WalletPage
