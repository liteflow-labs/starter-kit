import { MagicConnectConnector } from '@everipedia/wagmi-magic-connector'
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
  email: new MagicConnectConnector({
    options: {
      apiKey: environment.MAGIC_API_KEY,
      accentColor: theme.colors.brand[500],
      customHeaderText: 'Acme',
    },
  }) as unknown as Connector,
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
