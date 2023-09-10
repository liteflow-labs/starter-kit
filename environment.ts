import { NextIncomingMessage } from 'next/dist/server/request-meta'
import { createContext } from 'react'
import invariant from 'ts-invariant'
import {
  bsc,
  bscTestnet,
  Chain,
  goerli as ethereumGoerli,
  mainnet as ethereumMainnet,
  polygon,
  polygonMumbai,
} from 'wagmi/chains'

invariant(process.env.NEXT_PUBLIC_BASE_URL, 'Base url is not defined')
invariant(process.env.NEXT_PUBLIC_LITEFLOW_API_KEY, 'API key is not defined')
invariant(
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  'Wallet connect project id is not defined',
)

const environment = {
  /**
   * Base configuration
   */

  // API Key for the Liteflow API, you can get one at https://dashboard.liteflow.com/developer
  LITEFLOW_API_KEY: process.env.NEXT_PUBLIC_LITEFLOW_API_KEY,

  // Email address for end users to send reports to
  REPORT_EMAIL: `contact@liteflow.com`,

  // Number of items per page
  PAGINATION_LIMIT: 12,

  // Default value for the number of seconds an offer is valid (users can override this) (recommendation: 28 days)
  OFFER_VALIDITY_IN_SECONDS: 2419200, // 28 days

  // Default value for the number of seconds an auction is valid (users can override this) (recommendation: 7 days)
  AUCTION_VALIDITY_IN_SECONDS: 604800, // 7 days

  // Base URL of the website
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,

  // Maximum percentage of royalties
  MAX_ROYALTIES: 30,

  // (Optional) Bugsnag API Key, you can get one at https://www.bugsnag.com/
  BUGSNAG_API_KEY: process.env.NEXT_PUBLIC_BUGSNAG_API_KEY,

  /**
   * Home page configuration
   */

  // Ordered list of tokens to be highlighted on the homepage with the following format: [chainId]-[contractAddress]-[tokenId]
  FEATURED_TOKEN: [
    '1-0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7-10001',
    '1-0x8a90cab2b38dba80c64b7734e58ee1db38b8992e-1095',
    '1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-1068',
    '1-0xe785e82358879f061bc3dcac6f0444462d4b5330-1038',
    '1-0x1a92f7381b9f03921564a437210bb9396471050c-1036',
  ],

  // Ordered list of collections to be featured on the homepage with the following format: [chainId]-[contractAddress]
  HOME_COLLECTIONS: [
    '1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    '1-0xed5af388653567af2f388e6224dc7c4b3241c544',
    '1-0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
    '1-0x1a92f7381b9f03921564a437210bb9396471050c',
    '1-0x60e4d786628fea6478f785a6d7e704777c86a7c6',
    '1-0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949',
    '1-0xe785e82358879f061bc3dcac6f0444462d4b5330',
    '1-0x39ee2c7b3cb80254225884ca001f57118c8f21b6',
  ],

  // Ordered list of users to be featured on the homepage with the following format: [address]
  HOME_USERS: [
    '0x4b595014f7b45789c3f4e79324ae6d8090a6c8b5',
    '0x8533f3ffe30c9cf449cc112850e7ec815070509d',
    '0x4f379eb8bf6c83fa3aabf27a31be94d825e5de06',
    '0x6da89d36ba7cd6c371629b0724c2e17abf4049ee',
    '0x09ea03548b97aa045043ff55f5bd9505f2f135eb',
    '0x4ffa469c9a7f71a967e31884a5a64cf5916f905a',
  ],

  // List of tokens randomized to be featured on the homepage with the following format: [chainId]-[contractAddress]-[tokenId]
  // If empty, the tokens will be the last created ones
  HOME_TOKENS: [
    '1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-1',
    '1-0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d-1016',
    '1-0x60e4d786628fea6478f785a6d7e704777c86a7c6-10004',
    '1-0x60e4d786628fea6478f785a6d7e704777c86a7c6-10021',
    '1-0xed5af388653567af2f388e6224dc7c4b3241c544-1004',
    '1-0xed5af388653567af2f388e6224dc7c4b3241c544-1021',
    '1-0x8a90cab2b38dba80c64b7734e58ee1db38b8992e-1004',
    '1-0x8a90cab2b38dba80c64b7734e58ee1db38b8992e-1024',
    '1-0x39ee2c7b3cb80254225884ca001f57118c8f21b6-1004',
    '1-0x39ee2c7b3cb80254225884ca001f57118c8f21b6-1020',
    '1-0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949-10000',
    '1-0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949-10035',
    '1-0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7-10005',
    '1-0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7-10030',
    '1-0xe785e82358879f061bc3dcac6f0444462d4b5330-1001',
    '1-0xe785e82358879f061bc3dcac6f0444462d4b5330-1023',
    '1-0xa3aee8bce55beea1951ef834b99f3ac60d1abeeb-10005',
    '1-0xa3aee8bce55beea1951ef834b99f3ac60d1abeeb-10030',
    '1-0x1a92f7381b9f03921564a437210bb9396471050c-1005',
    '1-0x1a92f7381b9f03921564a437210bb9396471050c-1025',
    '1-0x60bb1e2aa1c9acafb4d34f71585d7e959f387769-1001',
    '1-0x60bb1e2aa1c9acafb4d34f71585d7e959f387769-1036',
    '1-0x8821bee2ba0df28761afff119d66390d594cd280-1002',
    '1-0x8821bee2ba0df28761afff119d66390d594cd280-1029',
    '1-0x248139afb8d3a2e16154fbe4fb528a3a214fd8e7-1006',
    '1-0x248139afb8d3a2e16154fbe4fb528a3a214fd8e7-103',
  ],

  /**
   * Wallet/chain configuration
   */

  // List of supported chains. Liteflow is supporting the following: ethereumMainnet, ethereumGoerli, bscTestnet, bsc, polygon, polygonMumbai
  CHAINS: [
    ethereumMainnet,
    ethereumGoerli,
    bscTestnet,
    bsc,
    polygon,
    polygonMumbai,
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
    } as Chain,
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
    } as Chain,
  ],

  // Wallet connect project ID, you can get one at https://cloud.walletconnect.com/
  WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,

  // (Optional) Magic API Key, you can get one at https://magic.link/
  MAGIC_API_KEY: process.env.NEXT_PUBLIC_MAGIC_API_KEY,

  // (Optional) Alchemy API key to activate fallback if public providers are not responsive
  ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,

  /**
   * SEO Configuration
   */

  // Name of the company to place in the SEO title and in the footer
  META_COMPANY_NAME: 'Acme, Inc.',

  // Title of the marketplace to place in the SEO title
  META_TITLE: 'Acme NFT Marketplace',

  // Description of the marketplace to place in the SEO description
  META_DESCRIPTION: 'Acme NFT Marketplace',

  // Keywords of the marketplace to place in the SEO keywords
  META_KEYWORDS: 'NFT, marketplace, platform, blockchain, liteflow',

  /**
   * NFT Mint Behavior
   */
  // Enable/disable the lazy minting feature. If enabled, the NFTs will be minted on the first sale
  LAZYMINT: true,

  // Enable/disable the unlockable content feature. If enabled, the NFTs will have unlockable content only accessible to owners
  UNLOCKABLE_CONTENT: true,
}

export type Environment = typeof environment

export const EnvironmentContext = createContext<Environment>({} as Environment)

const getEnvironment = async (
  req: NextIncomingMessage | undefined,
): Promise<Environment> => {
  const host = req
    ? `${req.headers['x-forwarded-proto'] || 'https'}://${
        req.headers['x-forwarded-host'] || req.headers['host']
      }`
    : window.location.origin
  const response = await fetch(`${host}/api/detect`, {
    headers: { 'Content-type': 'application/json' },
  })
  const metadata = await response.json()
  return {
    ...environment,
    ...metadata,
  }
}

export default getEnvironment
