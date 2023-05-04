import { NextPage } from 'next'
import { useMemo } from 'react'
import AccountTemplate from '../../components/Account/Account'
import Head from '../../components/Head'
import Loader from '../../components/Loader'
import WalletAccount from '../../components/Wallet/Account/Wallet'
import { useWalletCurrenciesQuery } from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useEagerConnect from '../../hooks/useEagerConnect'
import useLoginRedirect from '../../hooks/useLoginRedirect'
import SmallLayout from '../../layouts/small'

const WalletPage: NextPage = () => {
  const ready = useEagerConnect()
  const { address } = useAccount()
  useLoginRedirect(ready)
  const { data, loading } = useWalletCurrenciesQuery()
  const currencies = useMemo(() => data?.currencies?.nodes, [data])

  if (loading) return <Loader fullPage />
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
