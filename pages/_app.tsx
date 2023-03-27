import { ApolloProvider } from '@apollo/client'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { Box, ChakraProvider, useToast } from '@chakra-ui/react'
import { LiteflowProvider } from '@nft/hooks'
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import dayjs from 'dayjs'
import type { AppContext, AppInitialProps, AppProps } from 'next/app'
import App from 'next/app'
import { useRouter } from 'next/router'
import { GoogleAnalytics, usePageViews } from 'nextjs-google-analytics'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import React, {
  ComponentType,
  Fragment,
  PropsWithChildren,
  useEffect,
  useMemo,
} from 'react'
import { Cookies, CookiesProvider } from 'react-cookie'
import {
  useAccount as useWagmiAccount,
  useDisconnect,
  WagmiConfig,
} from 'wagmi'
import getClient from '../client'
import Banner from '../components/Banner/Banner'
import ChatWindow from '../components/ChatWindow'
import Footer from '../components/Footer/Footer'
import Head from '../components/Head'
import Navbar from '../components/Navbar/Navbar'
import { chains, client } from '../connectors'
import environment from '../environment'
import useAccount, { COOKIE_JWT_TOKEN } from '../hooks/useAccount'
import useSigner from '../hooks/useSigner'
import { theme } from '../styles/theme'
require('dayjs/locale/ja')
require('dayjs/locale/zh-cn')
require('dayjs/locale/es-mx')

NProgress.configure({ showSpinner: false })

function Layout({ children }: PropsWithChildren<{}>) {
  const router = useRouter()
  const signer = useSigner()
  const { address } = useAccount()
  const userProfileLink = useMemo(
    () => (address ? `/users/${address}` : '/login'),
    [address],
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
      'es-mx': {
        explore: 'Explorar',
        create: 'Crear',
        profile: 'Perfil',
        referral: 'Recomendación',
        support: 'Apoyo',
        terms: 'Letra chica',
        privacy: 'Privacidad',
      },
    }
    const locale = (router.locale || 'en') as keyof typeof texts
    return [
      { href: '/explore', label: texts[locale].explore },
      environment.MINTABLE_COLLECTIONS.length > 0
        ? { href: '/create', label: texts[locale].create }
        : undefined,
      { href: userProfileLink, label: texts[locale].profile },
      { href: '/referral', label: texts[locale].referral },
      { href: '/', label: texts[locale].support },
      { href: '/', label: texts[locale].terms },
      { href: '/', label: texts[locale].privacy },
      { href: 'https://twitter.com', label: 'Twitter' },
      { href: 'https://discord.com', label: 'Discord' },
    ].filter(Boolean)
  }, [router.locale, userProfileLink])

  return (
    <ChatWindow>
      <Box mt={12}>
        <Banner />
        <Navbar
          allowTopUp={environment.ALLOW_TOP_UP}
          router={{
            asPath: router.asPath,
            isReady: router.isReady,
            push: router.push,
            query: router.query,
            events: router.events,
          }}
          multiLang={{
            locale: router.locale,
            pathname: router.pathname,
            choices: [
              { label: 'En', value: 'en' },
              { label: '日本語', value: 'ja' },
              { label: '中文', value: 'zh-cn' },
              { label: 'Spanish', value: 'es-mx' },
            ],
          }}
          signer={signer}
          disableMinting={environment.MINTABLE_COLLECTIONS.length === 0}
        />
        {children}
        <Footer name="Acme, Inc." links={footerLinks} />
      </Box>
    </ChatWindow>
  )
}

function AccountProvider(props: PropsWithChildren<{}>) {
  const { login, jwtToken, logout } = useAccount()
  const { disconnect } = useDisconnect()
  const toast = useToast()

  const { connector } = useWagmiAccount({
    async onConnect({ connector }) {
      if (!connector) return
      try {
        await login(connector)
      } catch (e: any) {
        toast({
          title: e.reason || e.message || e.toString(),
          status: 'warning',
        })
        disconnect()
      }
    },
    onDisconnect() {
      void logout()
    },
  })

  // handle change of account
  useEffect(() => {
    if (!connector) return
    const handleLogin = () => login(connector)
    connector.on('change', handleLogin)
    return () => {
      connector.off('change', handleLogin)
    }
  }, [connector, login])

  const client = useMemo(
    // The client needs to be reset when the jwtToken changes but only on the client as the server will
    // always have the same token and will rerender this app multiple times and needs to preserve the cache
    () => getClient(jwtToken, typeof window !== 'undefined'),
    [jwtToken],
  )

  return <ApolloProvider client={client}>{props.children}</ApolloProvider>
}

type MyAppProps = { jwt: string | null; now: Date }

function MyApp({ Component, pageProps }: AppProps<MyAppProps>): JSX.Element {
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

  if (environment.BUGSNAG_API_KEY) {
    Bugsnag.start({
      apiKey: environment.BUGSNAG_API_KEY,
      plugins: [new BugsnagPluginReact(React)],
    })
  }
  const ErrorBoundary = environment.BUGSNAG_API_KEY
    ? (Bugsnag.getPlugin('react')?.createErrorBoundary(React) as ComponentType)
    : Fragment

  const cookies =
    typeof window === 'undefined'
      ? new Cookies({ [COOKIE_JWT_TOKEN]: pageProps.jwt })
      : undefined

  return (
    <ErrorBoundary>
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
      <WagmiConfig client={client}>
        <RainbowKitProvider
          chains={chains}
          theme={lightTheme({
            accentColor: theme.colors.brand[500],
            borderRadius: 'medium',
          })}
        >
          <CookiesProvider cookies={cookies}>
            <ChakraProvider theme={theme}>
              <LiteflowProvider endpoint={environment.GRAPHQL_URL}>
                <AccountProvider>
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                </AccountProvider>
              </LiteflowProvider>
            </ChakraProvider>
          </CookiesProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </ErrorBoundary>
  )
}

MyApp.getInitialProps = async (
  appContext: AppContext,
): Promise<AppInitialProps<MyAppProps>> => {
  const initialProps = await App.getInitialProps(appContext)
  const cookies = (appContext.ctx.req as any)?.cookies // TODO: fix type
  const jwt = cookies ? cookies['jwt-token'] : null
  // Generate the now time, rounded to the second to avoid re-rendering on the client
  // TOFIX: find a better way to share the time between the app and document
  const now = Math.floor(Date.now() / 1000) * 1000
  return {
    ...initialProps,
    pageProps: {
      ...initialProps.pageProps,
      jwt,
      now,
    },
  }
}

export default MyApp
