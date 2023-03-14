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
import invariant from 'ts-invariant'
import {
  Chain,
  configureChains,
  Connector,
  createClient,
  goerli,
  mainnet,
} from 'wagmi'
import { bsc, bscTestnet, polygon, polygonMumbai } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import environment from './environment'
import { theme } from './styles/theme'

export const { chains, provider } = configureChains<Chain>(
  [mainnet, goerli, bscTestnet, bsc, polygon, polygonMumbai],
  [publicProvider()],
)

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
        walletConnectWallet({ chains }),
        braveWallet({ chains, shimDisconnect }),
        emailConnector({
          chains,
          chainId: environment.CHAIN_ID,
        }),
      ],
    },
  ]

  return {
    connectors: connectorsForWallets(wallets),
    wallets,
  }
}

const { connectors } = getDefaultWallets({
  appName: environment.APP_NAME,
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
  chainId,
}: {
  chains: any[]
  chainId: number
}): Wallet {
  const apiKey = environment.MAGIC_API_KEY
  invariant(apiKey, 'missing MAGIC_API_KEY')
  const rpcUrl = (function () {
    switch (chainId) {
      case mainnet.id:
        return 'https://rpc.ankr.com/eth'
      case goerli.id:
        return 'https://rpc.ankr.com/eth_goerli'
      case polygon.id:
        return 'https://rpc.ankr.com/polygon'
      case polygonMumbai.id:
        return 'https://rpc.ankr.com/polygon_mumbai'
      case bsc.id:
        return 'https://rpc.ankr.com/bsc'
      case bscTestnet.id:
        return 'https://rpc.ankr.com/bsc_testnet_chapel'
    }
  })()
  invariant(rpcUrl, `no rpcUrl found for chain ${chainId}`)
  return {
    id: 'magic',
    name: 'Magic',
    iconUrl: 'https://svgshare.com/i/iJK.svg',
    iconBackground: '#fff',
    createConnector: () => {
      const connector = new MagicConnectConnector({
        chains: chains,
        options: {
          apiKey: apiKey,
          accentColor: theme.colors.brand[500],
          customHeaderText: environment.APP_NAME,
          magicSdkConfiguration: {
            network: {
              rpcUrl,
              chainId,
            },
          },
        },
      }) as unknown as Connector
      return {
        connector,
      }
    },
  }
}
