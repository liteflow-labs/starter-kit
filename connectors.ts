import { MagicConnectConnector } from '@everipedia/wagmi-magic-connector'
import {
  connectorsForWallets,
  Wallet,
  WalletList,
} from '@rainbow-me/rainbowkit'
import {
  braveWallet,
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { Chain, configureChains, Connector, createClient } from 'wagmi'
import {
  bsc,
  bscTestnet,
  goerli,
  mainnet,
  polygon,
  polygonMumbai,
} from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import environment from './environment'

export const { chains, provider } = configureChains<Chain>(environment.CHAINS, [
  publicProvider(),
])

// Copied from https://github.com/rainbow-me/rainbowkit/blob/main/packages/rainbowkit/src/wallets/getDefaultWallets.ts#L11
// Only added the shimDisconnect option
const getDefaultWallets = ({
  appName,
  chains,
  shimDisconnect,
}: {
  appName: string
  chains: Chain[]
  shimDisconnect?: boolean
}): {
  connectors: ReturnType<typeof connectorsForWallets>
  wallets: WalletList
} => {
  const wallets: WalletList = [
    {
      groupName: 'Popular',
      wallets: [
        injectedWallet({ chains, shimDisconnect }),
        rainbowWallet({ chains, shimDisconnect }),
        coinbaseWallet({ appName, chains }),
        metaMaskWallet({ chains, shimDisconnect }),
        environment.WALLET_CONNECT_PROJECT_ID
          ? walletConnectWallet({ chains })
          : undefined,
        braveWallet({ chains, shimDisconnect }),
        environment.MAGIC_API_KEY
          ? emailConnector({ chains, apiKey: environment.MAGIC_API_KEY })
          : undefined,
      ].filter(Boolean),
    },
  ]

  return {
    connectors: connectorsForWallets(wallets),
    wallets,
  }
}

const { connectors } = getDefaultWallets({
  appName: environment.META_TITLE,
  chains,
  shimDisconnect: true,
})

export const client = createClient({
  autoConnect: true,
  provider,
  connectors: connectors,
})

function emailConnector({
  chains,
  apiKey,
}: {
  chains: any[]
  apiKey: string
}): Wallet {
  return {
    id: 'magic',
    name: 'Magic',
    iconUrl: '/magic.svg',
    iconBackground: '#fff',
    createConnector: () => {
      const connector = new MagicConnectConnector({
        chains: chains,
        options: {
          apiKey: apiKey,
          networks: [
            { chainId: mainnet.id, rpcUrl: 'https://rpc.ankr.com/eth' },
            { chainId: goerli.id, rpcUrl: 'https://rpc.ankr.com/eth_goerli' },
            { chainId: polygon.id, rpcUrl: 'https://rpc.ankr.com/polygon' },
            {
              chainId: polygonMumbai.id,
              rpcUrl: 'https://rpc.ankr.com/polygon_mumbai',
            },
            { chainId: bsc.id, rpcUrl: 'https://rpc.ankr.com/bsc' },
            {
              chainId: bscTestnet.id,
              rpcUrl: 'https://rpc.ankr.com/bsc_testnet_chapel',
            },
          ],
        },
      }) as unknown as Connector
      return {
        connector,
      }
    },
  }
}
