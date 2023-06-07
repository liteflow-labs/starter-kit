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
    '80001-0x7c68c3c59ceb245733a2fdeb47f5f7d6dbcc65b3-42728329798185476104569684045014434977602555793693139688081182813192562446854',
    '80001-0x7c68c3c59ceb245733a2fdeb47f5f7d6dbcc65b3-42728329798185476104569684045014434977602555793693139688045754842099928417655',
    '80001-0x7c68c3c59ceb245733a2fdeb47f5f7d6dbcc65b3-42728329798185476104569684045014434977602555793693139688029603075124255299633',
    '80001-0x7c68c3c59ceb245733a2fdeb47f5f7d6dbcc65b3-42728329798185476104569684045014434977602555793693139688022518523903183557889',
  ],

  // Ordered list of collections to be featured on the homepage with the following format: [chainId]-[contractAddress]
  HOME_COLLECTIONS: [
    '1-0x3b3ee1931dc30c1957379fac9aba94d1c48a5405',
    '1-0xe12edaab53023c75473a5a011bdb729ee73545e8',
    '1-0x762bc5880f128dcac29cffdde1cf7ddf4cfc39ee',
    '97-0xcfbb45ff528c8ff6542887f631a1f704b92cf7db',
  ],

  // Ordered list of users to be featured on the homepage with the following format: [address]
  HOME_USERS: [
    '0x4b595014f7b45789c3f4e79324ae6d8090a6c8b5',
    '0x8108457554bc5822dc55b8adaa421ffeb970e09d',
    '0x5e7760acf5d659278747b95da2ab2b5ea7171615',
    '0x8533f3ffe30c9cf449cc112850e7ec815070509d',
    '0xd68a4b996d84b122a7b39a7d8dc6b354789b1f5c',
    '0x3625af2cfbf95a8d5b82b7b73a65213f845568e3',
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
