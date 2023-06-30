import { connectorsForWallets, WalletList } from '@rainbow-me/rainbowkit'
import {
  braveWallet,
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { Chain, configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import environment from './environment'

export const { chains, publicClient, webSocketPublicClient } =
  configureChains<Chain>(environment.CHAINS, [publicProvider()])

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
  projectId: environment.WALLET_CONNECT_PROJECT_ID,
  chains,
  shimDisconnect: true,
})

export const client = createConfig({
  autoConnect: true,
  connectors: connectors,
  publicClient,
  webSocketPublicClient,
})
