import invariant from 'ts-invariant'
import {
  bsc,
  bscTestnet,
  goerli as ethereumGoerli,
  mainnet as ethereumMainnet,
  polygon,
  polygonMumbai,
} from 'wagmi/chains'

invariant(process.env.NEXT_PUBLIC_BASE_URL, 'Base url is not defined')
invariant(process.env.NEXT_PUBLIC_LITEFLOW_API_KEY, 'API key is not defined')

const environment = {
  /**
   * Base configuration
   */

  // API Key for the Liteflow API, you can get one at https://dashboard.liteflow.com/developer
  LITEFLOW_API_KEY: process.env.NEXT_PUBLIC_LITEFLOW_API_KEY,

  // Email address for end users to send reports to
  REPORT_EMAIL: `contact@domain.tld`,

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
    '1-0x127e479ac59a1ea76afdedf830fecc2909aa4cae-8833',
    '1-0xef9c21e3ba31a74910fc7e7cb3fc814ad842ad6e-7979',
    '137-0x9d3aca725a289c6e798355592cd3dd5e43fa14a5-101902',
  ],

  // Ordered list of collections to be featured on the homepage with the following format: [chainId]-[contractAddress]
  HOME_COLLECTIONS: [
    '1-0xef9c21e3ba31a74910fc7e7cb3fc814ad842ad6e',
    '1-0x127e479ac59a1ea76afdedf830fecc2909aa4cae',
    '137-0x9d3aca725a289c6e798355592cd3dd5e43fa14a5',
  ],

  // Ordered list of users to be featured on the homepage with the following format: [address]
  HOME_USERS: [
    '0x4b595014f7b45789c3f4e79324ae6d8090a6c8b5',
    '0x8108457554bc5822dc55b8adaa421ffeb970e09d',
    '0x5e7760acf5d659278747b95da2ab2b5ea7171615',
    '0x8533f3ffe30c9cf449cc112850e7ec815070509d',
    '0x49027ef8931082ca59f0037b80a4f518d500bc4f',
  ],

  // List of tokens randomized to be featured on the homepage with the following format: [chainId]-[contractAddress]-[tokenId]
  // If empty, the tokens will be the last created ones
  HOME_TOKENS: [],

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
  ],

  // (Optional) Wallet connect project ID, you can get one at https://cloud.walletconnect.com/
  WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,

  // (Optional) Magic API Key, you can get one at https://magic.link/
  MAGIC_API_KEY: process.env.NEXT_PUBLIC_MAGIC_API_KEY,

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
}

export default environment
