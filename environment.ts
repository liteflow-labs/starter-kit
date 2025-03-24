import { NextIncomingMessage } from 'next/dist/server/request-meta'
import { createContext } from 'react'
import invariant from 'ts-invariant'
import {
  Chain,
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  mainnet as ethereumMainnet,
  sepolia as ethereumSepolia,
  neonDevnet,
  neonMainnet,
  polygon,
} from 'wagmi/chains'

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

  // List of supported chains. Liteflow is supporting the following: ethereumMainnet, ethereumSepolia, bscTestnet, bsc, polygon, polygonAmoy, neonMainnet, neonDevnet, arbitrum, arbitrumSepolia, lightlinkPhoenix, lightlinkPegasus, base, baseSepolia
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

  // List of banners to be displayed on the homepage
  HOME_BANNERS: {
    // URL of the image to display
    image: string

    // (Optional) Title of the banner
    title?: string

    // (Optional) Content of the banner
    content?: string

    // Text color of the banner. Default is white
    textColor: string

    // (Optional) Button to display on the banner
    button?: {
      // Text of the button
      text: string

      // URL to redirect to when the button is clicked
      href: string

      // (Optional) Whether the URL is external or not (default: false)
      isExternal?: boolean
    }
  }[]

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

export const EnvironmentContext = createContext<Environment>({} as Environment)

const getEnvironment = async (
  req: NextIncomingMessage | undefined,
): Promise<Environment> => {
  invariant(process.env.NEXT_PUBLIC_BASE_URL, 'Base url is not defined')
  invariant(process.env.NEXT_PUBLIC_LITEFLOW_API_KEY, 'API key is not defined')
  invariant(
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    'Wallet connect project id is not defined',
  )
  const host = req
    ? `${req.headers['x-forwarded-proto'] || 'https'}://${
        req.headers['x-forwarded-host'] || req.headers['host']
      }`
    : window.location.origin
  const response = await fetch(`${host}/api/detect`, {
    headers: { 'Content-type': 'application/json' },
  })
  const {
    metadata,
    id,
    domain,
    maxRoyaltiesPerTenThousand,
    offerValiditySeconds,
    hasLazyMint,
  } = await response.json()
  return {
    // Base configuration
    LITEFLOW_API_KEY: id || process.env.NEXT_PUBLIC_LITEFLOW_API_KEY,
    REPORT_EMAIL: metadata?.REPORT_EMAIL || '',
    PAGINATION_LIMIT: 12,
    OFFER_VALIDITY_IN_SECONDS: offerValiditySeconds,
    BASE_URL: domain || process.env.NEXT_PUBLIC_BASE_URL,
    MAX_ROYALTIES: maxRoyaltiesPerTenThousand / 100,
    BUGSNAG_API_KEY: process.env.NEXT_PUBLIC_BUGSNAG_API_KEY,
    // Theme configuration
    LOGO: metadata?.LOGO || '/logo.svg',
    FAVICON: metadata?.FAVICON || '/favicon.svg',
    BRAND_COLOR: metadata?.BRAND_COLOR || '#245BFF',
    // Wallet/chain configuration
    CHAINS: [
      ethereumMainnet,
      ethereumSepolia,
      {
        ...bsc,
        rpcUrls: {
          ...bsc.rpcUrls,
          default: { http: ['https://bsc-dataseed.binance.org'] },
          public: { http: ['https://bsc-dataseed.binance.org'] },
          alchemy: {
            http: ['https://bnb-mainnet.g.alchemy.com/v2'],
            webSocket: ['wss://bnb-mainnet.g.alchemy.com/v2'],
          },
        },
      },
      {
        ...bscTestnet,
        rpcUrls: {
          ...bscTestnet.rpcUrls,
          alchemy: {
            http: ['https://bnb-testnet.g.alchemy.com/v2'],
            webSocket: ['wss://bnb-testnet.g.alchemy.com/v2'],
          },
        },
      },
      polygon,
      {
        id: 80_002,
        name: 'Polygon Amoy',
        network: 'polygon-amoy',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: {
          alchemy: {
            http: ['https://polygon-amoy.g.alchemy.com/v2'],
            webSocket: ['wss://polygon-amoy.g.alchemy.com/v2'],
          },
          default: {
            http: ['https://rpc-amoy.polygon.technology'],
          },
          public: {
            http: ['https://rpc-amoy.polygon.technology'],
          },
        },
        blockExplorers: {
          etherscan: {
            name: 'Etherscan',
            url: 'https://amoy.polygonscan.com',
          },
          default: {
            name: 'Etherscan',
            url: 'https://amoy.polygonscan.com',
          },
        },
        contracts: {
          multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 3127388,
          },
        },
        testnet: true,
      },
      {
        ...neonMainnet,
        blockExplorers: {
          default: {
            name: 'Blockscout',
            url: 'https://neon.blockscout.com',
          },
        },
      },
      {
        ...neonDevnet,
        blockExplorers: {
          default: {
            name: 'Blockscout',
            url: 'https://neon-devnet.blockscout.com',
          },
        },
      },
      arbitrum,
      arbitrumSepolia,
      {
        name: 'Lightlink Phoenix Mainnet',
        network: 'lightlink-phoenix',
        id: 1890,
        nativeCurrency: {
          decimals: 18,
          name: 'Ether',
          symbol: 'ETH',
        },
        rpcUrls: {
          default: {
            http: ['https://replicator.phoenix.lightlink.io/rpc/v1'],
          },
          public: {
            http: ['https://replicator.phoenix.lightlink.io/rpc/v1'],
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
        name: 'Lightlink Pegasus Testnet',
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
            http: ['https://replicator.pegasus.lightlink.io/rpc/v1'],
          },
          public: {
            http: ['https://replicator.pegasus.lightlink.io/rpc/v1'],
          },
        },
        blockExplorers: {
          default: {
            name: 'LightLink Pegasus Explorer',
            url: 'https://pegasus.lightlink.io',
          },
        },
      },
      base,
      baseSepolia,
    ],
    WALLET_CONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    MAGIC_API_KEY: process.env.NEXT_PUBLIC_MAGIC_API_KEY,
    ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    // Home page configuration
    HOME_BANNERS: metadata.HOME_BANNERS || [],
    FEATURED_TOKEN: metadata.FEATURED_TOKEN || [],
    HOME_COLLECTIONS: metadata.HOME_COLLECTIONS || [],
    HOME_USERS: metadata.HOME_USERS || [],
    HOME_TOKENS: metadata.HOME_TOKENS || [],
    // SEO Configuration
    META_COMPANY_NAME: metadata?.META_COMPANY_NAME || 'Liteflow',
    META_TITLE: metadata?.META_TITLE || 'Acme NFT Marketplace',
    META_DESCRIPTION: metadata?.META_DESCRIPTION || '',
    META_KEYWORDS: metadata?.META_KEYWORDS || '',
    // NFT Mint Behavior
    LAZYMINT: hasLazyMint,
  }
}

export default getEnvironment
