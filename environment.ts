import request from 'graphql-request'
import { LRUCache } from 'lru-cache'
import { createContext } from 'react'
import invariant from 'ts-invariant'
import {
  arbitrum,
  arbitrumSepolia,
  bsc,
  bscTestnet,
  Chain,
  goerli as ethereumGoerli,
  mainnet as ethereumMainnet,
  neonDevnet,
  neonMainnet,
  polygon,
  polygonMumbai,
} from 'wagmi/chains'

type RemoteConfig = {
  name: string
  hasLazyMint: boolean
  maxRoyaltiesPerTenThousand: number
  offerValiditySeconds: number
  metadata: Partial<{
    REPORT_EMAIL: string

    LOGO: string
    FAVICON: string
    BRAND_COLOR: string

    FEATURED_TOKEN: string[]
    HOME_COLLECTIONS: string[]
    HOME_USERS: string[]
    HOME_TOKENS: string[]

    META_TITLE: string
    META_KEYWORDS: string
    META_DESCRIPTION: string
    META_COMPANY_NAME: string
  }>
}

export type Environment = {
  /**
   * Base configuration
   */

  // API Key for the Liteflow API, you can get one at https://dashboard.liteflow.com/developer
  LITEFLOW_API_KEY: string

  // Email address for end users to send reports to
  REPORT_EMAIL: string

  // Number of items per page
  PAGINATION_LIMIT: number

  // Default value for the number of seconds an offer is valid (users can override this) (recommendation: 28 days)
  OFFER_VALIDITY_IN_SECONDS: number

  // Base URL of the website
  BASE_URL: string

  // Maximum percentage of royalties
  MAX_ROYALTIES: number

  // (Optional) Bugsnag API Key, you can get one at https://www.bugsnag.com/
  BUGSNAG_API_KEY?: string

  /**
   * Theme configuration
   */

  // URL of the logo to place in the header
  LOGO: string

  // URL of the favicon
  FAVICON: string

  // Brand color to use for the theme
  BRAND_COLOR: string

  /**
   * Wallet/chain configuration
   */

  // List of supported chains. Liteflow is supporting the following: ethereumMainnet, ethereumGoerli, bscTestnet, bsc, polygon, polygonMumbai
  CHAINS: Chain[]

  // Wallet connect project ID, you can get one at https://cloud.walletconnect.com/
  WALLET_CONNECT_PROJECT_ID: string

  // (Optional) Magic API Key, you can get one at https://magic.link/
  MAGIC_API_KEY?: string

  // (Optional) Alchemy API key to activate fallback if public providers are not responsive
  ALCHEMY_API_KEY?: string

  /**
   * Home page configuration
   */

  // Ordered list of tokens to be highlighted on the homepage with the following format: [chainId]-[contractAddress]-[tokenId]
  FEATURED_TOKEN: string[]

  // Ordered list of collections to be featured on the homepage with the following format: [chainId]-[contractAddress]
  HOME_COLLECTIONS: string[]

  // Ordered list of users to be featured on the homepage with the following format: [address]
  HOME_USERS: string[]

  // List of tokens randomized to be featured on the homepage with the following format: [chainId]-[contractAddress]-[tokenId]
  // If empty, the tokens will be the last created ones
  HOME_TOKENS: string[]

  /**
   * SEO Configuration
   */

  // Name of the company to place in the SEO title and in the footer
  META_COMPANY_NAME: string

  // Title of the marketplace to place in the SEO title
  META_TITLE: string

  // Description of the marketplace to place in the SEO description
  META_DESCRIPTION: string

  // Keywords of the marketplace to place in the SEO keywords
  META_KEYWORDS: string

  /**
   * NFT Mint Behavior
   */
  // Enable/disable the lazy minting feature. If enabled, the NFTs will be minted on the first sale
  LAZYMINT: boolean
}

const cache = new LRUCache({
  max: 100,
  ttl:
    typeof window === 'undefined'
      ? 1000 * 10 // 10 sec
      : 0, // no ttl, user need to refresh the page
  fetchMethod: async (key: string) => {
    invariant(key === 'config', 'Invalid key')
    const { config } = await request<{ config: RemoteConfig }>(
      `${
        process.env.NEXT_PUBLIC_LITEFLOW_BASE_URL || 'https://api.liteflow.com'
      }/${process.env.NEXT_PUBLIC_LITEFLOW_API_KEY}/graphql`,
      `query Config {
        config {
          name
          hasLazyMint
          maxRoyaltiesPerTenThousand
          offerValiditySeconds
          metadata
        }
      }`,
      undefined,
      [['origin', process.env.NEXT_PUBLIC_BASE_URL || '']],
    )
    return config
  },
})

export const EnvironmentContext = createContext<Environment>({} as Environment)

const getEnvironment = async (): Promise<Environment> => {
  invariant(process.env.NEXT_PUBLIC_BASE_URL, 'Base url is not defined')
  invariant(process.env.NEXT_PUBLIC_LITEFLOW_API_KEY, 'API key is not defined')
  invariant(
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    'Wallet connect project id is not defined',
  )
  const config = await cache.fetch('config')
  invariant(config, 'Config is not defined')
  const {
    name,
    hasLazyMint,
    maxRoyaltiesPerTenThousand,
    offerValiditySeconds,
    metadata,
  } = config

  return {
    // Base configuration
    LITEFLOW_API_KEY: process.env.NEXT_PUBLIC_LITEFLOW_API_KEY,
    REPORT_EMAIL: metadata.REPORT_EMAIL || '',
    PAGINATION_LIMIT: 12,
    OFFER_VALIDITY_IN_SECONDS: offerValiditySeconds,
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    MAX_ROYALTIES: maxRoyaltiesPerTenThousand / 100,
    BUGSNAG_API_KEY: process.env.NEXT_PUBLIC_BUGSNAG_API_KEY,
    // Theme configuration
    LOGO: metadata.LOGO || '/logo.svg',
    FAVICON: metadata.FAVICON || '/favicon.svg',
    BRAND_COLOR: metadata.BRAND_COLOR || '#245BFF',
    // Wallet/chain configuration
    CHAINS: [
      ethereumMainnet,
      ethereumGoerli,
      bscTestnet,
      bsc,
      polygon,
      polygonMumbai,
      neonMainnet,
      neonDevnet,
      arbitrum,
      arbitrumSepolia,
      {
        name: 'LightLink Phoenix',
        network: 'lightlink-phoenix',
        id: 1890,
        nativeCurrency: {
          decimals: 18,
          name: 'Ether',
          symbol: 'ETH',
        },
        rpcUrls: {
          default: {
            http: [
              'https://replicator-01.phoenix.lightlink.io/rpc/v1',
              'https://replicator-02.phoenix.lightlink.io/rpc/v1',
            ],
          },
          public: {
            http: [
              'https://replicator-01.phoenix.lightlink.io/rpc/v1',
              'https://replicator-02.phoenix.lightlink.io/rpc/v1',
            ],
          },
        },
        blockExplorers: {
          default: {
            name: 'LightLink Phoenix Explorer',
            url: 'https://phoenix.lightlink.io',
          },
        },
      },
      {
        name: 'LightLink Pegasus Testnet',
        network: 'lightlink-pegasus',
        testnet: true,
        id: 1891,
        nativeCurrency: {
          decimals: 18,
          name: 'Ether',
          symbol: 'ETH',
        },
        rpcUrls: {
          default: {
            http: [
              'https://replicator-01.pegasus.lightlink.io/rpc/v1',
              'https://replicator-02.pegasus.lightlink.io/rpc/v1',
            ],
          },
          public: {
            http: [
              'https://replicator-01.pegasus.lightlink.io/rpc/v1',
              'https://replicator-02.pegasus.lightlink.io/rpc/v1',
            ],
          },
        },
        blockExplorers: {
          default: {
            name: 'LightLink Pegasus Explorer',
            url: 'https://pegasus.lightlink.io',
          },
        },
      },
    ],
    WALLET_CONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    MAGIC_API_KEY: process.env.NEXT_PUBLIC_MAGIC_API_KEY,
    ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    // Home page configuration
    FEATURED_TOKEN: metadata.FEATURED_TOKEN || [],
    HOME_COLLECTIONS: metadata.HOME_COLLECTIONS || [],
    HOME_USERS: metadata.HOME_USERS || [],
    HOME_TOKENS: metadata.HOME_TOKENS || [],
    // SEO Configuration
    META_COMPANY_NAME: name,
    META_TITLE: metadata.META_TITLE || name,
    META_DESCRIPTION: metadata.META_DESCRIPTION || name,
    META_KEYWORDS: metadata.META_KEYWORDS || name,
    // NFT Mint Behavior
    LAZYMINT: hasLazyMint,
  }
}

export default getEnvironment
