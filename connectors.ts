import { MagicConnectConnector } from '@everipedia/wagmi-magic-connector'
import invariant from 'ts-invariant'
import {
  configureChains,
  Connector,
  createClient,
  goerli,
  mainnet,
} from 'wagmi'
import { bsc, bscTestnet, polygon, polygonMumbai } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
import environment from './environment'
import { theme } from './styles/theme'

export const { chains, provider } = configureChains(
  [mainnet, goerli, bscTestnet, bsc, polygon, polygonMumbai],
  [publicProvider()],
)

export const connectors: {
  injected?: InjectedConnector
  walletConnect?: WalletConnectConnector
  coinbase?: CoinbaseWalletConnector
  email?: Connector
} = {
  email: environment.MAGIC_API_KEY
    ? emailConnector(environment.CHAIN_ID)
    : undefined,
  injected: new InjectedConnector({}),
  walletConnect: new WalletConnectConnector({
    options: { version: '1' },
  }),
  coinbase: new CoinbaseWalletConnector({
    options: { appName: 'Acme' },
  }),
}

export const client = createClient({
  autoConnect: true,
  provider,
  connectors: [
    connectors.email,
    connectors.injected,
    connectors.coinbase,
    connectors.walletConnect,
  ].filter(Boolean),
})

function emailConnector(chainId: number) {
  invariant(environment.MAGIC_API_KEY, 'missing MAGIC_API_KEY')
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
  return new MagicConnectConnector({
    options: {
      apiKey: environment.MAGIC_API_KEY,
      accentColor: theme.colors.brand[500],
      customHeaderText: 'Acme',
      magicSdkConfiguration: {
        network: {
          rpcUrl,
          chainId,
        },
      },
    },
  }) as unknown as Connector
}
