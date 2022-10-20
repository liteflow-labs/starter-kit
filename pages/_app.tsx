import { Box } from '@chakra-ui/react'
import LiteflowNFTApp, {
  APOLLO_STATE_PROP_NAME,
  Footer,
  Navbar,
} from '@nft/components'
import { EmailConnector } from '@nft/email-connector'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import dayjs from 'dayjs'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { GoogleAnalytics, usePageViews } from 'nextjs-google-analytics'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useEffect, useMemo } from 'react'
import Banner from '../components/Banner/Banner'
import Head from '../components/Head'
import environment from '../environment'
import { theme } from '../styles/theme'
require('dayjs/locale/ja')
require('dayjs/locale/zh-cn')

NProgress.configure({ showSpinner: false })

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter()
  dayjs.locale(router.locale)
  usePageViews()

  useEffect(() => {
    const handleStart = () => NProgress.start()
    const handleStop = () => NProgress.done()

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleStop)
    router.events.on('routeChangeError', handleStop)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router])

  const userProfileLink = useMemo(
    () =>
      pageProps?.user?.address ? `/users/${pageProps.user.address}` : '/login',
    [pageProps?.user?.address],
  )

  const footerLinks = useMemo(() => {
    const texts = {
      en: {
        explore: 'Explore',
        create: 'Create',
        profile: 'Profile',
        referral: 'Referral',
        support: 'Support',
        terms: 'Terms',
        privacy: 'Privacy',
      },
      ja: {
        explore: '検索',
        create: '作成',
        profile: 'プロフィール',
        referral: '紹介',
        support: 'サポート',
        terms: '利用規約',
        privacy: 'プライバシーポリシー',
      },
      'zh-cn': {
        explore: '探讨',
        create: '创造',
        profile: '资料',
        referral: '转介',
        support: '支持',
        terms: '条款',
        privacy: '隐私',
      },
    }
    const locale = (router.locale || 'en') as keyof typeof texts
    return [
      { href: '/explore', label: texts[locale].explore },
      { href: '/create', label: texts[locale].create },
      { href: userProfileLink, label: texts[locale].profile },
      { href: '/referral', label: texts[locale].referral },
      { href: '/', label: texts[locale].support },
      { href: '/', label: texts[locale].terms },
      { href: '/', label: texts[locale].privacy },
      { href: 'https://twitter.com', label: 'Twitter' },
      { href: 'https://discord.com', label: 'Discord' },
    ]
  }, [router.locale, userProfileLink])

  const connectors = useMemo(
    () => ({
      email: new EmailConnector({
        apiKey: environment.MAGIC_API_KEY,
        options: {
          network: {
            rpcUrl: environment.PUBLIC_ETHEREUM_PROVIDER,
            chainId: environment.CHAIN_ID,
          },
        },
      }),
      injected: new InjectedConnector({
        supportedChainIds: [environment.CHAIN_ID],
      }),
      walletConnect: new WalletConnectConnector({
        rpc: {
          [environment.CHAIN_ID]: environment.PUBLIC_ETHEREUM_PROVIDER,
        },
        supportedChainIds: [environment.CHAIN_ID],
        chainId: environment.CHAIN_ID,
      }),
      coinbase: new WalletLinkConnector({
        supportedChainIds: [environment.CHAIN_ID],
        appName: 'Acme',
        url: 'https://demo.liteflow.com',
      }),
    }),
    [],
  )

  return (
    <>
      <Head
        title="Acme NFT Marketplace"
        description="The Web3 as a Service Company"
      >
        <meta
          name="keywords"
          content="NFT, marketplace, platform, white-label, blockchain"
        />

        <meta name="author" content="Acme, Inc." />
        <meta name="application-name" content="Acme NFT Marketplace" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://demo.liteflow.com" />

        <meta name="twitter:card" content="summary" />
      </Head>
      <GoogleAnalytics strategy="lazyOnload" />
      <LiteflowNFTApp
        ssr={typeof window === 'undefined'}
        endpointUri={environment.GRAPHQL_URL}
        cache={pageProps[APOLLO_STATE_PROP_NAME]}
        user={pageProps.user}
        connectors={connectors}
        bugsnagAPIKey={environment.BUGSNAG_API_KEY}
        theme={theme}
      >
        <Box mt={12}>
          <Banner />
          <Navbar
            allowTopUp={true}
            router={{
              asPath: router.asPath,
              isReady: router.isReady,
              push: router.push,
              query: router.query,
              events: router.events,
            }}
            login={{
              email: true,
              metamask: true,
              walletConnect: true,
              coinbase: true,
              networkName: environment.NETWORK_NAME,
            }}
            multiLang={{
              locale: router.locale,
              pathname: router.pathname,
              choices: [
                { label: 'En', value: 'en' },
                { label: '日本語', value: 'ja' },
                { label: '中文', value: 'zh-cn' },
              ],
            }}
          />
          <Component {...pageProps} />
          <Footer name="Acme, Inc." links={footerLinks} />
        </Box>
      </LiteflowNFTApp>
    </>
  )
}
export default MyApp
