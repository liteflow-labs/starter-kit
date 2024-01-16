import { ApolloProvider } from '@apollo/client'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { Box, ChakraProvider } from '@chakra-ui/react'
import { LiteflowProvider } from '@liteflow/react'
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import dayjs from 'dayjs'
import type { AppContext, AppInitialProps, AppProps } from 'next/app'
import App from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { GoogleAnalytics, usePageViews } from 'nextjs-google-analytics'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import React, {
  ComponentType,
  Fragment,
  JSX,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Cookies, CookiesProvider } from 'react-cookie'
import {
  WagmiConfig,
  useDisconnect,
  useAccount as useWagmiAccount,
} from 'wagmi'
import getClient from '../client'
import CartContext from '../components/CartContext'
import Footer from '../components/Footer/Footer'
import Navbar from '../components/Navbar/Navbar'
import connectors from '../connectors'
import getEnvironment, { Environment, EnvironmentContext } from '../environment'
import useAccount, { COOKIES, COOKIE_JWT_TOKEN } from '../hooks/useAccount'
import useEnvironment from '../hooks/useEnvironment'
import { getTheme } from '../styles/theme'
import Error from './_error'
require('dayjs/locale/ja')
require('dayjs/locale/zh-cn')
require('dayjs/locale/es-mx')

NProgress.configure({ showSpinner: false })

function Layout({ children }: PropsWithChildren) {
  const { META_COMPANY_NAME } = useEnvironment()
  const router = useRouter()
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
        support: 'Support',
        terms: 'Terms',
        privacy: 'Privacy',
      },
      ja: {
        explore: '検索',
        create: '作成',
        profile: 'プロフィール',
        support: 'サポート',
        terms: '利用規約',
        privacy: 'プライバシーポリシー',
      },
      'zh-cn': {
        explore: '探讨',
        create: '创造',
        profile: '资料',
        support: '支持',
        terms: '条款',
        privacy: '隐私',
      },
      'es-mx': {
        explore: 'Explorar',
        create: 'Crear',
        profile: 'Perfil',
        support: 'Apoyo',
        terms: 'Letra chica',
        privacy: 'Privacidad',
      },
    }
    const locale = (router.locale || 'en') as keyof typeof texts
    return [
      { href: '/explore', label: texts[locale].explore },
      { href: '/create', label: texts[locale].create },
      { href: userProfileLink, label: texts[locale].profile },
      { href: '/', label: texts[locale].support },
      { href: '/', label: texts[locale].terms },
      { href: '/', label: texts[locale].privacy },
      { href: 'https://twitter.com', label: 'Twitter' },
      { href: 'https://discord.com', label: 'Discord' },
    ].filter(Boolean)
  }, [router.locale, userProfileLink])

  return (
    <Box>
      <Navbar
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
      />
      {children}
      <Footer name={META_COMPANY_NAME} links={footerLinks} />
    </Box>
  )
}

function AccountProvider({
  children,
  onError,
}: PropsWithChildren<{ onError: (code: number) => void }>) {
  const { LITEFLOW_API_KEY, BASE_URL } = useEnvironment()
  const { login, jwtToken, logout } = useAccount()
  const { disconnect } = useDisconnect()

  const { connector } = useWagmiAccount({
    async onConnect({ connector }) {
      if (!connector) return
      try {
        await login(connector)
      } catch (e: any) {
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
    () =>
      getClient(
        LITEFLOW_API_KEY,
        jwtToken,
        BASE_URL,
        typeof window !== 'undefined',
        onError,
      ),
    [jwtToken, onError, LITEFLOW_API_KEY, BASE_URL],
  )

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export type MyAppProps = {
  jwt: string | null
  now: Date
  environment: Environment
}

function MyApp({ Component, pageProps }: AppProps<MyAppProps>): JSX.Element {
  const { environment } = pageProps
  const [errorCode, setErrorCode] = useState<number>()
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
      ? new Cookies({ [COOKIE_JWT_TOKEN]: pageProps.jwt } as COOKIES)
      : undefined

  const { chains, client } = useMemo(
    () => connectors(environment),
    [environment],
  )

  const theme = useMemo(() => getTheme(environment.BRAND_COLOR), [environment])

  return (
    <ErrorBoundary>
      <EnvironmentContext.Provider value={environment}>
        <Head>
          <meta name="keywords" content={environment.META_KEYWORDS} />

          <meta name="author" content={environment.META_COMPANY_NAME} />
          <meta name="application-name" content={environment.META_TITLE} />

          <meta property="og:type" content="website" />
          <meta property="og:url" content={environment.BASE_URL} />

          <meta name="twitter:card" content="summary" />
        </Head>
        <GoogleAnalytics strategy="lazyOnload" />
        <WagmiConfig config={client}>
          <RainbowKitProvider
            chains={chains}
            theme={lightTheme({
              accentColor: theme.colors.brand[500],
              borderRadius: 'medium',
            })}
          >
            <CookiesProvider cookies={cookies}>
              <ChakraProvider theme={theme}>
                <LiteflowProvider
                  apiKey={environment.LITEFLOW_API_KEY}
                  endpoint={process.env.NEXT_PUBLIC_LITEFLOW_BASE_URL}
                >
                  <AccountProvider onError={setErrorCode}>
                    <CartContext>
                      <Layout>
                        {errorCode ? (
                          <Error statusCode={errorCode} />
                        ) : (
                          <Component {...pageProps} />
                        )}
                      </Layout>
                    </CartContext>
                  </AccountProvider>
                </LiteflowProvider>
              </ChakraProvider>
            </CookiesProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </EnvironmentContext.Provider>
    </ErrorBoundary>
  )
}

MyApp.getInitialProps = async (
  appContext: AppContext & {
    ctx: {
      req?: { cookies?: COOKIES }
    }
  },
): Promise<AppInitialProps<MyAppProps>> => {
  const initialProps = (await App.getInitialProps(
    appContext,
  )) as AppInitialProps<{}> // force type of props to empty object instead of any so TS will properly require MyAppProps to be returned by this function
  const jwt = appContext.ctx.req?.cookies?.[COOKIE_JWT_TOKEN] || null
  // Generate the now time, rounded to the second to avoid re-rendering on the client
  // TOFIX: find a better way to share the time between the app and document
  const now = new Date(Math.floor(Date.now() / 1000) * 1000)
  return {
    ...initialProps,
    pageProps: {
      ...initialProps.pageProps,
      jwt,
      now,
      environment: await getEnvironment(),
    },
  }
}

export default MyApp
