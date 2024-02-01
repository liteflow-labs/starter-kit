import { UniversalWalletConnector } from '@magiclabs/wagmi-connector'
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
import type { Chain, Config } from 'wagmi'
import { configureChains, createConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { Environment } from './environment'

type ClientWithChain = {
  client: Config<any>
  chains: Chain[]
}

function connectors(environment: Environment): ClientWithChain {
  const providers = [publicProvider()]
  // add alchemy provider as fallback if ALCHEMY_API_KEY is set
  if (environment.ALCHEMY_API_KEY)
    providers.push(alchemyProvider({ apiKey: environment.ALCHEMY_API_KEY }))

  const { chains, publicClient } = configureChains<Chain>(
    environment.CHAINS,
    providers,
  )

  // Copied from https://github.com/rainbow-me/rainbowkit/blob/main/packages/rainbowkit/src/wallets/getDefaultWallets.ts#L11
  // Only added the shimDisconnect option
  const getDefaultWallets = ({
    appName,
    chains,
    projectId,
    shimDisconnect,
  }: {
    appName: string
    chains: Chain[]
    projectId: string
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
          rainbowWallet({ chains, projectId, shimDisconnect }),
          coinbaseWallet({ appName, chains }),
          metaMaskWallet({ chains, projectId, shimDisconnect }),
          walletConnectWallet({ chains, projectId }),
          braveWallet({ chains, shimDisconnect }),
          environment.MAGIC_API_KEY
            ? emailConnector({ chains, apiKey: environment.MAGIC_API_KEY })
            : undefined,
        ].filter(Boolean),
      },
    ]

    return {
      connectors: connectorsForWallets(wallets)(),
      wallets,
    }
  }

  const { connectors } = getDefaultWallets({
    appName: environment.META_TITLE,
    projectId: environment.WALLET_CONNECT_PROJECT_ID,
    chains,
    shimDisconnect: true,
  })

  const client = createConfig({
    autoConnect: true,
    connectors: connectors,
    publicClient,
  })

  return {
    client,
    chains,
  }
}

function emailConnector({
  chains,
  apiKey,
}: {
  chains: Chain[]
  apiKey: string
}): Wallet {
  return {
    id: 'magic',
    name: 'Magic',
    iconUrl: '/magic.svg',
    iconBackground: '#fff',
    createConnector: () => {
      const connector = new UniversalWalletConnector({
        chains: chains,
        options: {
          apiKey: apiKey,
          networks: chains.map((chain) => ({
            chainId: chain.id,
            rpcUrl:
              chain.id === 1 // the default provider for Ethereum Mainnet (cloudflare) is not working with Magic
                ? 'https://rpc.ankr.com/eth'
                : chain.rpcUrls.default.http[0]!,
          })),
        },
      })
      return {
        connector,
      }
    },
  }
}

export default connectors
