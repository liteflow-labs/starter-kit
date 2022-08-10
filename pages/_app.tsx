import LiteflowNFTApp, {
  APOLLO_STATE_PROP_NAME,
  Template,
} from '@nft/components'
import { EmailConnector } from '@nft/email-connector'
import { SiDribbble } from '@react-icons/all-files/si/SiDribbble'
import { SiFacebook } from '@react-icons/all-files/si/SiFacebook'
import { SiGithub } from '@react-icons/all-files/si/SiGithub'
import { SiInstagram } from '@react-icons/all-files/si/SiInstagram'
import { SiTwitter } from '@react-icons/all-files/si/SiTwitter'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { GoogleAnalytics, usePageViews } from 'nextjs-google-analytics'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useEffect, useMemo } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import Banner from '../components/Banner/Banner'
import Head from '../components/Head'
import environment from '../environment'
import '../styles/globals.css'

NProgress.configure({ showSpinner: false })

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter()
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

  const footerColumns = useMemo(
    () => [
      {
        title: 'Liteflow',
        links: [
          { href: 'https://liteflow.com', label: 'About' },
          { href: 'https://liteflow.com/#nft', label: 'NFT Solution' },
          {
            href: 'https://calendly.com/anthony-estebe/liteflow-nft-marketplace',
            label: 'Schedule a demo',
          },
        ],
      },
      {
        title: 'Platform',
        links: [
          { href: '/explore', label: 'Explore' },
          { href: '#', label: 'Activity' },
          { href: '#', label: 'Support' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { href: '#', label: 'Terms' },
          { href: '#', label: 'Privacy' },
        ],
      },
    ],
    [],
  )

  const footerSocials = useMemo(
    () => [
      { icon: SiFacebook, href: 'https://facebook.com' },
      { icon: SiInstagram, href: 'https://instagram.com' },
      { icon: SiTwitter, href: 'https://twitter.com' },
      { icon: SiGithub, href: 'https://github.com' },
      { icon: SiDribbble, href: 'https://dribbble.com' },
    ],
    [],
  )

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
        appName: 'Liteflow',
        url: 'https://nft.liteflow.com',
      }),
    }),
    [],
  )

  return (
    <>
      <Head
        title="Liteflow NFT Marketplace Solution - Demo"
        description="The next-generation NFT Marketplace tailored to your needs"
      >
        <meta
          name="keywords"
          content="NFT, marketplace, platform, white-label, blockchain"
        />

        <meta name="author" content="Liteflow, Inc." />
        <meta name="application-name" content="Liteflow NFT Marketplace" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nft.liteflow.com" />

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
      >
        <div className="mt-12">
          <Banner />
          <Template.Navbar
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
          />
          <Component {...pageProps} />
          <Template.Footer
            name="Liteflow"
            columns={footerColumns}
            socials={footerSocials}
            newsletter={<Template.Newsletter />}
          />
        </div>
      </LiteflowNFTApp>
    </>
  )
}
export default MyApp
